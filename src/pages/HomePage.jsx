import { Navigation } from '../components/home/Navigation';
import { Hero } from '../components/home/Hero';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { CustomizerCTA } from '../components/home/CustomizerCTA';
import { Testimonials } from '../components/home/Testimonials';
import { MobileNav } from '../components/home/MobileNav';
import { Footer } from '../components/home/Footer';

export default function HomePage() {
  const images = {
    hero: 'https://images.unsplash.com/photo-1634283715079-d91bbed0ece0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnaWZ0JTIwYm94JTIwc2lsayUyMHJpYmJvbnxlbnwxfHx8fDE3NzQ0MzI1NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    collections: {
      main: 'https://images.unsplash.com/photo-1711548244761-ade8497ed10a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZ29sZCUyMHN0YXRpb25lcnklMjBsZWF0aGVyJTIwYWNjZXNzb3JpZXN8ZW58MXx8fHwxNzc0NDMyNTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      secondary: 'https://images.unsplash.com/photo-1660038018962-b186901da9a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd2F0Y2glMjBib3glMjBzaWx2ZXIlMjBlbmdyYXZpbmd8ZW58MXx8fHwxNzc0NDMyNTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      watch: 'https://images.unsplash.com/photo-1587789976991-e1e980e98815?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuYWwlMjBjZXJhbWljJTIwbXVncyUyMHBhc3RlbCUyMGNvbG9yc3xlbnwxfHx8fDE3NzQ0MzI1NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      ceramics: 'https://images.unsplash.com/photo-1587789976991-e1e980e98815?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuYWwlMjBjZXJhbWljJTIwbXVncyUyMHBhc3RlbCUyMGNvbG9yc3xlbnwxfHx8fDE3NzQ0MzI1NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      basket: 'https://images.unsplash.com/photo-1597757288541-e2513b697e77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnaWZ0JTIwYmFza2V0JTIwY2hvY29sYXRlcyUyMGNoYW1wYWduZXxlbnwxfHx8fDE3NzQ0MzI1NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    testimonials: {
      person1: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzQ0MDA4OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      person2: 'https://images.unsplash.com/photo-1544799048-555232c964cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzc21hbiUyMG5hdnklMjBzdWl0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0NDMyNTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      person3: 'https://images.unsplash.com/photo-1658437902644-e5414badf0f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGN1cmx5JTIwaGFpciUyMGdsYXNzZXMlMjBzbWlsaW5nfGVufDF8fHx8MTc3NDQzMjU0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  };

  return (
    <div className="home-page-theme min-h-screen">
      <Navigation />
      <main className="pt-24 pb-32">
        <Hero heroImage={images.hero} />
        <FeaturedCollections images={images.collections} />
        <CustomizerCTA />
        <Testimonials testimonialImages={images.testimonials} />
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}
