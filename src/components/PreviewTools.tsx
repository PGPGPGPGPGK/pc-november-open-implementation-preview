'use client';
import {useState} from 'react';
import {EventRegister} from './events/EventRegister';
import {EventExtras} from './events/EventExtras';
import {EventRegistrationClosed} from './events/EventRegistrationClosed';
import {categories,cancellationPolicy} from '@/lib/preview-data';

export function ReplayAnnouncement(){return <button type="button" onClick={()=>{localStorage.removeItem('pc_november_open_popup_last_shown');location.reload();}}>Replay announcement</button>;}

// Review-only controls exercise the existing components with synthetic states.
export function StateReview(){
 const [mode,setMode]=useState('');
 const full=categories.map(c=>({...c,confirmed_count:24,waitlist_open:true}));
 return <details className="preview-state-review"><summary>Preview state controls — synthetic data only</summary>
 <label>Review a state <select value={mode} onChange={e=>setMode(e.target.value)}><option value="">Choose a state…</option><option value="full">Both categories full / free waitlist</option><option value="closed">Registration closed</option></select></label>
 {mode==='full'?<><EventRegister slug="november-2026" eventName="November Open — simulated full categories" categories={full} cancellationPolicy={cancellationPolicy}/><EventExtras slug="november-2026" categories={full}/></>:null}
 {mode==='closed'?<EventRegistrationClosed eventName="November Open — simulated closed"/>:null}
 </details>;
}
