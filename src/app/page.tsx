import {Hero} from '@/components/landing/Hero';
import {TournamentPopup} from '@/components/landing/TournamentPopup';
import {ReplayAnnouncement} from '@/components/PreviewTools';

export default function Homepage(){return <><TournamentPopup/><div className="preview-tools"><p>Existing homepage hero and November announcement. The popup appears after two seconds.</p><ReplayAnnouncement/></div><Hero/></>;}
