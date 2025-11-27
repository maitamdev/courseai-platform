# 🚀 Deploy Course AI lên Vercel

## 📋 **Bước 1: Chuẩn Bị**

### **1.1. Push code lên GitHub**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### **1.2. Tạo tài khoản Vercel**
- Truy cập: https://vercel.com
- Sign up với GitHub account

## 🎯 **Bước 2: Deploy**

### **2.1. Import Project**
1. Click **"Add New Project"**
2. Chọn **"Import Git Repository"**
3. Chọn repository của bạn
4. Click **"Import"**

### **2.2. Configure Project**

**Framework Preset:** Vite
**Root Directory:** `./` (leave as default)
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### **2.3. Environment Variables**

Click **"Environment Variables"** và thêm:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Lấy từ đâu?**
- Vào Supabase Dashboard → Settings → API
- Copy **Project URL** và **anon public key**

### **2.4. Deploy**
Click **"Deploy"** và đợi ~2-3 phút

## ✅ **Bước 3: Sau Khi Deploy**

### **3.1. Update Supabase Redirect URLs**

Vào Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:** (Add tất cả)
```
https://your-app.vercel.app
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/reset-password
https://your-app.vercel.app/**
```

### **3.2. Test Website**

Truy cập: `https://your-app.vercel.app`

Test:
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập
- ✅ Reset password
- ✅ Tìm bạn bè
- ✅ Mua khóa học

## 🔧 **Troubleshooting**

### **Build Failed?**

**Check logs:**
- Vào Vercel Dashboard → Deployments → Click vào deployment failed
- Xem error logs

**Common issues:**
1. **Missing dependencies:** Chạy `npm install` local để check
2. **TypeScript errors:** Chạy `npm run build` local
3. **Environment variables:** Verify đã add đúng

### **404 Errors?**

File `vercel.json` đã có rewrites để handle SPA routing.

Nếu vẫn lỗi, check:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### **Supabase Connection Failed?**

1. Check environment variables trong Vercel
2. Verify CORS settings trong Supabase
3. Check API keys còn valid không

### **Email Confirmation Not Working?**

Update redirect URLs trong Supabase (Bước 3.1)

## 🎨 **Custom Domain (Optional)**

### **Add Custom Domain:**

1. Vào Vercel Dashboard → Settings → Domains
2. Add domain của bạn (vd: `courseai.com`)
3. Update DNS records theo hướng dẫn
4. Đợi DNS propagate (~5-10 phút)
5. Update Supabase redirect URLs với domain mới

## 🔄 **Auto Deploy**

Vercel tự động deploy khi:
- ✅ Push code lên GitHub
- ✅ Merge pull request
- ✅ Update branch

**Disable auto deploy:**
Settings → Git → Disable "Production Branch"

## 📊 **Monitor**

### **Analytics:**
- Vercel Dashboard → Analytics
- Xem traffic, performance, errors

### **Logs:**
- Vercel Dashboard → Deployments → View Function Logs
- Real-time logs của app

## 🚀 **Performance Tips**

### **1. Enable Edge Functions**
Vercel tự động optimize với Edge Network

### **2. Image Optimization**
Sử dụng Vercel Image Optimization:
```tsx
import Image from 'next/image' // Nếu dùng Next.js
```

### **3. Caching**
File `vercel.json` đã config cache cho assets

### **4. Environment-specific builds**
- Production: Optimized build
- Preview: Fast build cho testing

## 🎯 **Deployment Checklist**

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Supabase redirect URLs updated
- [ ] Website accessible
- [ ] Auth working (signup/login)
- [ ] Database queries working
- [ ] Custom domain added (optional)

## 📞 **Support**

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Supabase Issues:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

**Deployment time: ~5 phút**
**Difficulty: Easy**
**Cost: FREE (Hobby plan)** 🎉
