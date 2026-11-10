const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const base=process.env.PREVIEW_URL||'http://localhost:3020/pc-november-open-implementation-preview';
const artifactDir=__dirname;
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});const results=[];
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900}});const requests=[],errors=[];
 context.on('request',r=>requests.push({method:r.method(),url:r.url()}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/',{waitUntil:'networkidle'});
 const popup=page.getByRole('dialog');await popup.waitFor({state:'visible'});
 assert.equal(await popup.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(248, 246, 239)');
 await page.screenshot({path:path.join(artifactDir,`popup-${width}.png`)});
 await popup.getByRole('link',{name:'Register now'}).click();
 await page.waitForSelector('#evt-cat');assert(page.url().includes('/events/november-2026'));
 assert.equal(await page.locator('#evt-cat').inputValue(),'preview-singles');
 assert.equal(await page.getByLabel(/promotional emails/).first().isChecked(),false);
 const pay=()=>page.getByRole('button',{name:/Register & Pay/}).first();
 await pay().click();await page.getByText('Enter your name and a valid phone number.',{exact:true}).waitFor();
 const fill=async()=>{await page.locator('#evt-name').fill('Preview Player');await page.locator('#evt-phone').fill('+910000000001');await page.locator('#evt-gender').selectOption('male');await page.locator('#evt-dupr').fill('PREVIEW-ONLY');await page.locator('#evt-dupr-rating').fill('3.2');};
 await fill();await page.locator('#evt-dupr-rating').fill('4.1');await pay().click();await page.getByText('This category needs DUPR 3.7 or below.',{exact:true}).waitFor();
 await page.locator('#evt-dupr-rating').fill('3.2');await pay().click();await page.getByText('Please agree to the tournament rules, Terms & Conditions and Privacy Policy.',{exact:true}).waitFor();
 await page.getByLabel(/I agree to the tournament rules/).first().check();
 await page.locator('#evt-cat').selectOption('preview-doubles');await pay().click();await page.getByText("Doubles needs your partner's name and phone number.",{exact:true}).waitFor();
 await page.locator('#evt-pname').fill('Preview Partner');await page.locator('#evt-pphone').fill('+910000000002');await page.locator('#evt-pgender').selectOption('female');
 assert((await pay().innerText()).includes('1,599'));assert(await page.locator('a[href$="/terms/"]').count()>0);
 await page.screenshot({path:path.join(artifactDir,`registration-${width}.png`),fullPage:true});
 await pay().click();const sim=page.getByRole('dialog',{name:'Preview checkout simulator'});await sim.waitFor();assert((await sim.innerText()).includes('1,599'));
 await sim.getByRole('button',{name:'Simulate success'}).click();await page.getByRole('heading',{name:'Preview registration complete'}).waitFor();assert((await page.locator('main').innerText()).includes('No spot was reserved'));
 for(const outcome of ['Cancel simulation','Simulate failure']){
  await page.goto(base+'/events/november-2026/',{waitUntil:'networkidle'});await fill();await page.getByLabel(/I agree to the tournament rules/).first().check();
  await pay().click();const modal=page.getByRole('dialog',{name:'Preview checkout simulator'});assert((await modal.innerText()).includes('799'));
  await modal.getByRole('button',{name:outcome}).click();await page.getByText(outcome==='Cancel simulation'?'Payment cancelled. You can try again.':'Payment failed. Try again or use a different method.',{exact:true}).waitFor();
 }
 // Free partner-request form, without sending anything outside the browser.
 await page.goto(base+'/events/november-2026/',{waitUntil:'networkidle'});
 const partner=page.locator('form').filter({has:page.getByRole('heading',{name:/Request a doubles partner/})});
 const fields=partner.locator('input:not([type="checkbox"])');
 for(const [i,value] of ['Preview Player','+910000000001','preview@example.invalid','PREVIEW-ONLY','3.2'].entries())await fields.nth(i).fill(value);
 await partner.locator('input[type="checkbox"]').first().check();await partner.getByRole('button',{name:'Send partner request'}).click();await page.getByText('Pairing request received',{exact:true}).waitFor();
 await page.getByText(/Preview state controls/).click();await page.getByLabel('Review a state').selectOption('full');
 await page.getByRole('heading',{name:/This category is full/}).first().waitFor();
 await page.getByLabel('Review a state').selectOption('closed');assert((await page.locator('details').innerText()).includes('Registration'));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
 assert.deepEqual(errors,[]);assert.deepEqual(requests.filter(r=>!['GET','HEAD'].includes(r.method)),[]);
 const allowedOrigin=new URL(base).origin;
 assert.deepEqual(requests.filter(r=>new URL(r.url).origin!==allowedOrigin),[]);
 results.push({width,popup:true,navigation:true,singles:true,doubles:true,validation:true,consent:true,simulatedSuccess:true,simulatedCancel:true,simulatedFailure:true,partnerRequest:true,waitlistState:true,closedState:true,horizontalOverflow:false,externalRequests:0,writeRequests:0,pageErrors:errors});
 await context.close();
}
fs.writeFileSync(path.join(artifactDir,process.env.PREVIEW_URL?'public-browser-results.json':'local-browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
