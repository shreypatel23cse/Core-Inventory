import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Operation, OperationItem, Stock, MoveHistory } from '../types';

export const inventoryService = {
  // Real-time listeners
  subscribeToProducts: (callback: (products: Product[]) => void) => {
    const q = query(collection(db, 'products'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));
  },

  subscribeToOperations: (type: string | null, callback: (ops: Operation[]) => void) => {
    let q = query(collection(db, 'operations'));
    if (type) {
      q = query(q, where('type', '==', type));
    }
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Operation)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'operations'));
  },

  subscribeToStock: (callback: (stock: Stock[]) => void) => {
    const q = query(collection(db, 'stock'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Stock)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'stock'));
  },

  // Actions
  createOperation: async (op: Partial<Operation>, items: Partial<OperationItem>[]) => {
    try {
      const opRef = await addDoc(collection(db, 'operations'), {
        ...op,
        createdAt: new Date().toISOString(),
        status: 'draft'
      });

      const batch = writeBatch(db);
      items.forEach(item => {
        const itemRef = doc(collection(db, `operations/${opRef.id}/items`));
        batch.set(itemRef, { ...item, operationId: opRef.id });
      });

      await batch.commit();
      return opRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'operations');
    }
  },

  validateOperation: async (opId: string) => {
    // This is a complex operation that should ideally be a cloud function,
    // but we'll implement it client-side for this demo.
    // 1. Get operation and items
    // 2. Update stock levels
    // 3. Create move history
    // 4. Update operation status to 'done'
    try {
      const opRef = doc(db, 'operations', opId);
      const opSnap = await getDocs(query(collection(db, 'operations'), where('__name__', '==', opId)));
      const op = opSnap.docs[0].data() as Operation;
      
      const itemsSnap = await getDocs(collection(db, `operations/${opId}/items`));
      const items = itemsSnap.docs.map(d => d.data() as OperationItem);

      const batch = writeBatch(db);

      for (const item of items) {
        // Update stock
        if (op.sourceLocationId) {
          const sourceStockRef = doc(db, 'stock', `${item.productId}_${op.sourceLocationId}`);
          batch.set(sourceStockRef, {
            productId: item.productId,
            locationId: op.sourceLocationId,
            quantity: increment(-item.quantity)
          }, { merge: true });
        }

        if (op.destLocationId) {
          const destStockRef = doc(db, 'stock', `${item.productId}_${op.destLocationId}`);
          batch.set(destStockRef, {
            productId: item.productId,
            locationId: op.destLocationId,
            quantity: increment(item.quantity)
          }, { merge: true });
        }

        // Move history
        const moveRef = doc(collection(db, 'move_history'));
        batch.set(moveRef, {
          operationId: opId,
          productId: item.productId,
          fromLocationId: op.sourceLocationId || null,
          toLocationId: op.destLocationId || null,
          quantity: item.quantity,
          timestamp: new Date().toISOString()
        });
      }

      batch.update(opRef, { status: 'done' });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `operations/${opId}`);
    }
  },

  seedDemoData: async () => {
    try {
      const batch = writeBatch(db);
      
      // Add Warehouses
      const wh1Ref = doc(collection(db, 'warehouses'));
      batch.set(wh1Ref, { name: 'Main Warehouse', code: 'WH-MAIN', address: '123 Industrial Way' });
      
      const wh2Ref = doc(collection(db, 'warehouses'));
      batch.set(wh2Ref, { name: 'Secondary Hub', code: 'WH-HUB', address: '456 Logistics Blvd' });

      // Add Locations
      const loc1Ref = doc(collection(db, 'locations'));
      batch.set(loc1Ref, { name: 'Shelf A1', code: 'A1', warehouseId: wh1Ref.id, type: 'internal' });
      
      const loc2Ref = doc(collection(db, 'locations'));
      batch.set(loc2Ref, { name: 'Shelf B2', code: 'B2', warehouseId: wh1Ref.id, type: 'internal' });

      // Add Products
      const p1Ref = doc(collection(db, 'products'));
      batch.set(p1Ref, { name: 'Steel Rods', sku: 'SR-001', category: 'Raw Material', uom: 'kg', description: 'High grade steel rods', active: true });
      
      const p2Ref = doc(collection(db, 'products'));
      batch.set(p2Ref, { name: 'Aluminum Sheets', sku: 'AS-005', category: 'Raw Material', uom: 'm2', description: '2mm aluminum sheets', active: true });

      await batch.commit();
      console.log('Demo data seeded successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed');
    }
  }
};
