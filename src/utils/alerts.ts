import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

export const alertSuccess = (message: string) => {
  Toast.fire({
    icon: 'success',
    title: message,
    background: '#ffffff',
    color: '#0f172a',
    iconColor: '#10b981',
  });
};

export const alertError = (message: string) => {
  Toast.fire({
    icon: 'error',
    title: message,
    background: '#ffffff',
    color: '#0f172a',
    iconColor: '#f43f5e',
  });
};

export const alertWarning = (message: string) => {
  Toast.fire({
    icon: 'warning',
    title: message,
    background: '#ffffff',
    color: '#0f172a',
    iconColor: '#f59e0b',
  });
};

export const confirmAction = async (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, proceed!',
    background: '#ffffff',
    color: '#0f172a',
    customClass: {
      popup: 'rounded-[2rem]',
      confirmButton: 'rounded-xl font-black uppercase text-[10px] tracking-widest px-6 py-3',
      cancelButton: 'rounded-xl font-black uppercase text-[10px] tracking-widest px-6 py-3',
    }
  });
};
