import {setPreviewPaymentState} from './preview-transport';

// Deliberately NOT Razorpay Checkout. This local simulator never creates an
// order, requests card details, sends form data, or loads an external script.
export class PreviewCheckout {
  private dialog:HTMLDialogElement|null=null;
  constructor(private opts:Record<string,unknown>){}
  open(){
    const dialog=document.createElement('dialog');this.dialog=dialog;
    dialog.className='preview-checkout';dialog.setAttribute('aria-label','Preview checkout simulator');
    const title=document.createElement('h2');title.textContent='Preview checkout — no real payment';
    const detail=document.createElement('p');detail.textContent=`Simulated amount: ₹${(Number(this.opts.amount)/100).toLocaleString('en-IN')}. No registration is saved, no money is charged and no message is sent. Use fictional contact details.`;
    dialog.append(title,detail);
    const button=(text:string,action:()=>void)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;dialog.append(b);};
    button('Simulate success',()=>{setPreviewPaymentState('captured');const handler=this.opts.handler as ((r:Record<string,string>)=>void)|undefined;handler?.({razorpay_order_id:'preview-order-not-real',razorpay_payment_id:'preview-simulated',razorpay_signature:'not-a-signature'});this.close();});
    button('Simulate failure',()=>{setPreviewPaymentState('failed');this.close();});
    const dismiss=()=>{this.close();const modal=this.opts.modal as {ondismiss?:()=>void}|undefined;modal?.ondismiss?.();};
    button('Cancel simulation',dismiss);dialog.oncancel=e=>{e.preventDefault();dismiss();};
    document.body.append(dialog);dialog.showModal();
  }
  close(){this.dialog?.close();this.dialog?.remove();this.dialog=null;}
}
