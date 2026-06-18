import { Navigation } from '../components/home/Navigation';
import { Hero } from '../components/home/Hero';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { CustomizerCTA } from '../components/home/CustomizerCTA';
import { Testimonials } from '../components/home/Testimonials';
import { Footer } from '../components/home/Footer';
import { MobileNav } from '../components/home/MobileNav';

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
      person1: 'https://www.chinatelecom.com.cn/ct/image/img/favicon.ico',
      person2: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Tsinghua_University_Logo.svg',
      person3: 'https://s1.aigei.com/src/img/png/c6/c644b94f9d1b4b69b5f3d4500452caf0.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:Ou4nF3r6kP_VSoZbjxJ5ecsjq-g=',
    },
  };

  return (
    <div className="home-page-theme min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-24 pb-16">
        <Hero heroImage={images.hero} />
        <FeaturedCollections images={images.collections} />
        <CustomizerCTA />
        <Testimonials testimonialImages={images.testimonials} />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

