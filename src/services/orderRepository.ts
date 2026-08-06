import { Order } from '../types';

export interface OrderRepository {
  getAllOrders(): Promise<Order[]>;
}
