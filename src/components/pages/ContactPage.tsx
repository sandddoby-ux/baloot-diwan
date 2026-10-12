import React, { useState } from 'react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'general', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 select-none space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          الدعم الفني وخدمة العملاء 💬
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          فريق ديوان البلوت في خدمتكم على مدار الساعة. نسعد باستفساراتكم وملاحظاتكم
        </p>
      </div>

      <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <span className="text-5xl block animate-bounce">📨</span>
            <h2 className="text-xl font-black text-amber-300">تم استلام رسالتك بنجاح!</h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
              سيتواصل معك فريق الدعم الفني عبر البريد الإلكتروني خلال أقل من ساعتين عمل.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">الاسم الكريم:</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="سعود بن فهد"
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">البريد الإلكتروني:</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="saud@example.com"
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 text-left dir-ltr"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">موضوع الرسالة:</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="general">استفسار عام</option>
                <option value="billing">استفسارات الاشتراكات والمدفوعات</option>
                <option value="rules">استفسار حول قانون أو نشرة</option>
                <option value="bug">الإبلاغ عن مشكلة فنية</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">تفاصيل الرسالة:</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="اكتب استفسارك هنا بكل تفصيل..."
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-sm shadow-xl transition-all"
            >
              إرسال الرسالة للدعم الفني 🚀
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
