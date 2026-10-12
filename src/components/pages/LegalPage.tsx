import React, { useState } from 'react';
import { resetUserData } from '../../services/storage';

export const LegalPage: React.FC = () => {
  const [deletedToast, setDeletedToast] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccountData = () => {
    resetUserData();
    setDeletedToast(true);
    setConfirmDelete(false);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-10">
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          الشروط والأحكام وسياسة الخصوصية ⚖️
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          متوافق مع نظام حماية البيانات الشخصية بالمملكة العربية السعودية ودول مجلس التعاون
        </p>
      </div>

      {deletedToast && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm text-center">
          ✓ تم مسح وحذف جميع بيانات الحساب وسجل المباريات نهائياً بنجاح! جارٍ التحديث...
        </div>
      )}

      {/* Terms of Service */}
      <section className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-xs sm:text-sm text-gray-300 leading-relaxed">
        <h2 className="text-lg font-black text-amber-300 border-b border-white/10 pb-2">
          1. شروط الاستخدام وقواعد النزاهة
        </h2>
        <p>
          مرحباً بكم في منصة "ديوان البلوت". بدخولك واستخدامك للموقع فإنك توافق على الالتزام بقواعد اللعب النظيف والأخلاق العامة في الدردشة والتعامل مع اللاعبين الآخرين.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-400">
          <li>يمنع استخدام أي برامج مساعدة أو محاولات التلاعب بالنتائج.</li>
          <li>يمنع استخدام الألفاظ غير اللائقة في الدردشة وغرف اللعب.</li>
          <li>ديوان البلوت منصة ترفيهية خالية تماماً من المراهنات والقمار بكافة أشكاله.</li>
        </ul>
      </section>

      {/* Privacy Policy */}
      <section className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-xs sm:text-sm text-gray-300 leading-relaxed">
        <h2 className="text-lg font-black text-amber-300 border-b border-white/10 pb-2">
          2. سياسة الخصوصية وحماية البيانات
        </h2>
        <p>
          نلتزم بحماية خصوصيتك وعدم مشاركة أو بيع أي بيانات شخصية لأي طرف ثالث.
        </p>
        <p>
          • البيانات المحفوظة تشمل فقط: اسم اللاعب المستعار، الإحصائيات (معدل الفوز والنقاط)، وتفضيلات المظهر.
        </p>
        <p>
          • معالجة المدفوعات تتم عبر بوابات مشفرة معتمدة (مدى، Apple Pay) دون حفظ أي بيانات بنكية أو أرقام بطاقات حساسة على خوادمنا.
        </p>
      </section>

      {/* Account Deletion */}
      <section className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-xs sm:text-sm text-gray-300 leading-relaxed">
        <h2 className="text-lg font-black text-rose-300 border-b border-rose-500/20 pb-2">
          3. حق حذف الحساب والبيانات (Right to Erasure)
        </h2>
        <p>
          وفقاً لحقوق المستخدم وسياسات الخصوصية، يحق لك في أي وقت حذف حسابك ومسح كافة بياناتك وسجل مبارياتك نهائياً بضغطة زر واحدة.
        </p>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="py-2.5 px-5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 font-bold text-xs transition-all"
          >
            طلب حذف حسابي ومسح كافة بياناتي 🗑️
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/50 space-y-3">
            <p className="text-xs text-rose-300 font-bold">
              هل أنت متأكد من رغبتك في حذف الحساب؟ سيتم مسح كافة الإحصائيات والأبناط نهائياً.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccountData}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                نعم، تأكيد الحذف النهائي ✕
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs"
              >
                تراجع
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
