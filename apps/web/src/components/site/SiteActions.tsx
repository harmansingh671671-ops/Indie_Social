import { Copy, ExternalLink, Flag, Heart, MoreHorizontal, Share2 } from 'lucide-react';
import type { Site } from '../../types';
import { ActionMenu } from '../common/ActionMenu';
import { SaveButton } from './SaveButton';
import { useToast } from '../common/Toast';
import { copyText, openSite, siteLink } from '../../lib/share';
import { useAppState } from '../../state/AppState';

interface SiteActionsProps {
  site: Site;
}

/** Hover actions shown on a feed card. */
export function SiteActions({ site }: SiteActionsProps) {
  const { showToast } = useToast();
  const { toggleLike } = useAppState();

  const handleCopy = async () => {
    const ok = await copyText(siteLink(site));
    showToast(ok ? 'Link copied' : 'Could not copy the link');
  };

  const handleDeviceShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: site.title,
          text: site.description,
          url: siteLink(site),
        });
        return;
      } catch {
        return;
      }
    }
    await handleCopy();
  };

  const shareItems = [
    { label: 'Copy link', icon: <Copy size={17} />, onSelect: handleCopy },
    {
      label: 'Open site',
      icon: <ExternalLink size={17} />,
      onSelect: () => openSite(site.url),
    },
    {
      label: 'Share to…',
      icon: <Share2 size={17} />,
      onSelect: handleDeviceShare,
    },
  ];

  const moreItems = [
    {
      label: 'Open site',
      icon: <ExternalLink size={17} />,
      onSelect: () => openSite(site.url),
    },
    {
      label: 'Like this site',
      icon: <Heart size={17} />,
      onSelect: () => {
        const next = toggleLike(site.id);
        showToast(next ? 'Liked' : 'Like removed');
      },
    },
    {
      label: 'Report site',
      icon: <Flag size={17} />,
      danger: true,
      onSelect: () => showToast('Thanks — this site is queued for review'),
    },
  ];

  return (
    <div className="site-actions site-actions--card">
      <div className="site-actions__group">
        <ActionMenu
          label="Share site"
          items={shareItems}
          trigger={<Share2 size={18} />}
          iconVariant="light"
        />
        <ActionMenu
          label="More options"
          items={moreItems}
          trigger={<MoreHorizontal size={18} />}
          iconVariant="light"
        />
      </div>
      <SaveButton siteId={site.id} size="sm" />
    </div>
  );
}
