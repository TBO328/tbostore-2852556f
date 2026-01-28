

# خطة تحديث اسم المستودع

## الهدف
تحديث اسم المستودع في الكود من `tbostore-45e11bff` إلى `tbostore-2852556f` لضمان عمل GitHub Pages بشكل صحيح.

---

## التغييرات المطلوبة

### الملف: `vite.config.ts`
تغيير السطر 8:

**قبل:**
```typescript
base: process.env.GITHUB_PAGES ? '/tbostore-45e11bff/' : '/',
```

**بعد:**
```typescript
base: process.env.GITHUB_PAGES ? '/tbostore-2852556f/' : '/',
```

---

## ملاحظات
- ملف `.github/workflows/deploy.yml` لا يحتاج تعديل - الإعدادات صحيحة
- ملف `public/404.html` لا يحتاج تعديل - يعمل بشكل ديناميكي

---

## بعد التحديث
1. سيتم دفع التغييرات تلقائياً إلى GitHub
2. سيبدأ الـ Workflow تلقائياً
3. بعد نجاح البناء، الموقع سيكون متاح على:
   `https://tbo328.github.io/tbostore-2852556f/`

