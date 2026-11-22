import { Order } from '@/types';

export function getWhatsAppReceiptUrl(order: Order): string {
  const digits = order.customerMobile.replace(/\D/g, '');
  const phone = digits.startsWith('00')
    ? digits.slice(2)
    : digits.startsWith('0')
      ? `92${digits.slice(1)}`
      : digits.startsWith('92') || digits.length !== 10
        ? digits
        : `92${digits}`;
  const itemLines = order.items.map(
    item => `- ${item.productName} x ${item.quantity}: Rs. ${item.subtotal}`
  );
  const message = [
    `Assalam-o-Alaikum ${order.customerName},`,
    'Thank you for ordering from Shrebian Shawarma!',
    '',
    `Receipt for order ${order.orderNumber}`,
    ...itemLines,
    `Subtotal: Rs. ${order.subtotal}`,
    ...(order.deliveryCharges > 0 ? [`Delivery: Rs. ${order.deliveryCharges}`] : []),
    ...(order.discount > 0 ? [`Discount: -Rs. ${order.discount}`] : []),
    `Total: Rs. ${order.grandTotal}`,
    '',
    'Shrebian Shawarma | Lahore | 03120073794'
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
