#!/bin/bash
echo "Menarik update terbaru dari repository..."
git pull origin main

echo "Menginstall dependensi..."
npm install

echo "Mem-build aplikasi..."
npm run build

echo "Me-restart PM2..."
# Ganti 'simpend' dengan nama aplikasi kamu jika berbeda
pm2 restart simpend

echo "Selesai! Aplikasi sudah terupdate."
