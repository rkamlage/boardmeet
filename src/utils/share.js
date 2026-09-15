export const shareToWhatsApp = async (text, fallbackUrl = null) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Try native share API first (Mobile)
  if (navigator.share && isMobile) {
    try {
      await navigator.share({
        title: 'BoardMeet',
        text: text,
        url: fallbackUrl
      });
      return;
    } catch (err) {
      console.log('Native share failed or cancelled', err);
      // fallback to wa.me below
    }
  }

  // Fallback for PC or if native share fails
  // On PC this opens WhatsApp Web or the Desktop App
  const waLink = `https://wa.me/?text=${encodeURIComponent(text + (fallbackUrl ? ' ' + fallbackUrl : ''))}`;
  window.open(waLink, '_blank');
};
