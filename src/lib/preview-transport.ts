import { tournament, categories, cancellationPolicy } from './preview-data';

let paymentState:'created'|'captured'|'failed'='created';
export function setPreviewPaymentState(state:typeof paymentState){paymentState=state;}

// All adapters return local memory values only. No fetch, storage, database,
// notification, payment SDK, server handler or customer communication exists.
export async function previewTransport(path:string,opts:RequestInit={}):Promise<unknown>{
  if(path==='/v1/tournaments/november-2026')return {tournament,categories,cancellation_policy:cancellationPolicy};
  if(path.endsWith('/register')){
    const body=JSON.parse(String(opts.body??'{}')) as {category_id?:string};
    const category=categories.find(c=>c.id===body.category_id);
    if(!category)throw Error('Preview category not found');
    paymentState='created';
    // Personal fields are neither retained nor sent anywhere.
    return {registration_id:'PREVIEW-NOT-A-REGISTRATION',status:'pending',payment:{payment_id:'preview-payment',razorpay_order_id:'preview-order-not-real',razorpay_key_id:'PREVIEW_DISABLED',amount_paise:category.entry_fee*100,currency:'INR'}};
  }
  if(path.includes('/public?'))return {id:'preview-payment',status:paymentState,booking_id:null,captured_at:null};
  if(path.includes('/verify')){paymentState='captured';return {status:'captured'};}
  if(path.endsWith('/partner-request'))return {id:'PREVIEW-NOT-A-REQUEST',status:'awaiting_partner'};
  if(path.endsWith('/waitlist'))return {id:'PREVIEW-NOT-A-WAITLIST-ENTRY',position:1,status:'waitlisted'};
  throw Error('This operation is disabled in the design preview.');
}
