import { Star } from 'lucide-react';

export function Testimonials({ testimonialImages = {} }) {
  const testimonials = [
    {
      name: '中国电信',
      text: '"充电宝彩印的细节程度令人惊叹。这感觉就像是在赠送一件艺术品,而不仅仅是一份礼物。"',
      image: testimonialImages.person1,
      offset: '',
    },
    {
      name: '清华大学',
      text: '"我们的企业订单处理得非常精准。定制刻制完美匹配了我们品牌的奢华美学。"',
      image: testimonialImages.person2,
      offset: 'md:translate-y-8',
    },
    {
      name: '中信银行',
      text: '"作为定制产品,物流速度出奇地快。包装本身就非常精美,甚至不需要额外的礼品纸。"',
      image: testimonialImages.person3,
      offset: '',
    },
  ];

  return (
    <section className="px-8 max-w-7xl mx-auto mb-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {testimonials.map((testimonial, index) => (
          <div key={index} className={`space-y-6 ${testimonial.offset}`}>
            <div className="flex gap-1 text-[var(--tertiary)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-xl font-medium leading-relaxed italic">{testimonial.text}</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-container-highest)] overflow-hidden">
                <img
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                  src={testimonial.image}
                />
              </div>
              <div>
                <p className="text-sm font-bold">{testimonial.name}</p>
                <p className="text-xs text-[var(--on-surface-variant)]">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
