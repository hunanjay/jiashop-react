import { Navigation } from '../components/home/Navigation';
import { Hero } from '../components/home/Hero';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { CustomizerCTA } from '../components/home/CustomizerCTA';
import { Testimonials } from '../components/home/Testimonials';
import { MobileNav } from '../components/home/MobileNav';
import { Footer } from '../components/home/Footer';

// Local Assets
import heroImage from './admin/images/huaweicixi.jpeg';
import 鼠标 from './admin/images/鼠标.jpeg';
import 折叠键盘 from './admin/images/折叠键盘.png';
import th from './admin/images/lihe.png';
import ceramics from './admin/images/shubiaochongdianbao.jpeg';
import basket from './admin/images/toumingshubiao.jpeg';
import heroImage1 from './admin/images/wuheyituozhanwu.png';

export default function HomePage() {
  const images = {
    hero: heroImage,
    collections: {
      main: 鼠标,
      secondary: 折叠键盘,
      watch: heroImage1,
      basket: ceramics,
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
