import { useToastStore } from '@/store/toastStore'

export function showBrowserNotification(title: string, body: string, toastOnly = false) {
  // 1. Selalu tampilkan In-App Toast
  useToastStore.getState().addToast(title, body)

  if (toastOnly) return

  // 2. Coba tampilkan OS Browser Notification jika didukung & diizinkan
  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/vite.svg' })
    return
  }

  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/vite.svg' })
      }
    })
  }
}
