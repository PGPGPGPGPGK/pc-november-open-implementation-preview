import type { PublicTournament, PublicTournamentCategory, TournamentCancellationPolicy } from './api';

// Synthetic preview data only. No production API or database was queried.
export const tournament: PublicTournament = {
  id:'preview-november-open',slug:'november-2026',name:'Pickleball Central Open — November 2026',
  venue:'Pickleball Central',venue_address:'Peerzadiguda, Hyderabad',start_date:'2026-11-29',end_date:'2026-11-29',
  reg_open_at:'2026-11-01T00:00:00+05:30',reg_close_at:'2026-11-28T18:29:59.000Z',banner_storage_key:null,
  description:'Sunday 29 November 2026. ₹30,000 total cash prize pool. Open Singles ₹799 per player (report 6 PM) · Open Doubles ₹1,599 per team (report 3 PM). GST included. DUPR 3.7 or below; a valid DUPR ID is mandatory for every player.',
  rules_md:'Open Singles: any gender. Open Doubles: any gender combination. DUPR 3.7 or below. DUPR ID mandatory.',
  prize_pool:30000,status:'published',registration_closed:false,
};
export const categories: PublicTournamentCategory[] = ['singles','doubles'].map((play,i)=>({
  id:`preview-${play}`,skill_level:'open',gender:'open',play_type:play as 'singles'|'doubles',pricing_mode:'per_team',
  entry_fee:i===0?799:1599,current_price:i===0?799:1599,early_bird_fee:null,early_bird_slots:null,early_bird_remaining:null,early_bird_active:false,
  dupr_cap_max:3.7,max_registrations:24,schedule_date:'2026-11-29',start_time:i===0?'18:00':'15:00',status:'open',confirmed_count:0,waitlist_open:false,
}));
// Existing approved tournament ladder, displayed from a preview fixture.
export const cancellationPolicy: TournamentCancellationPolicy={name:'Default tournament',tiers:[{min_hours_before:168,refund_percent:100},{min_hours_before:72,refund_percent:50},{min_hours_before:0,refund_percent:0}]};
