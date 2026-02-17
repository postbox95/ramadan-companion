import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Facebook, MessageCircle, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// X (Twitter) icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface Props {
  contentRef: React.RefObject<HTMLDivElement>;
}

export default function ShareAndExport({ contentRef }: Props) {
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!contentRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(contentRef.current, { backgroundColor: null, scale: 2 });
    const link = document.createElement('a');
    link.download = 'ramadan-planner.png';
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: 'Downloaded!', description: 'Your planner has been saved as an image.' });
  };

  const shareUrl = window.location.href;
  const shareText = '🌙 Check out my Ramadan Planner! Track prayers, duas, and daily goals.';

  const shareLinks = [
    { name: 'WhatsApp', icon: MessageCircle, url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}` },
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}` },
    { name: 'X', icon: XIcon, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!', description: 'Share it with your friends and family.' });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleDownload} variant="outline" size="sm" className="border-primary/20 text-foreground">
        <Download className="w-4 h-4 mr-1" /> Download PNG
      </Button>
      {shareLinks.map(({ name, icon: Icon, url }) => (
        <Button key={name} variant="outline" size="sm" className="border-primary/20 text-foreground" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Icon className="w-4 h-4 mr-1" /> {name}
          </a>
        </Button>
      ))}
      <Button onClick={copyLink} variant="outline" size="sm" className="border-primary/20 text-foreground">
        <Link2 className="w-4 h-4 mr-1" /> Copy Link
      </Button>
    </div>
  );
}
