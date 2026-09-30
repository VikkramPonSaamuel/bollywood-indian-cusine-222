try{const a=localStorage.getItem('bw-appearance');document.documentElement.dataset.appearance=a==='light'?'light':'dark';}catch{document.documentElement.dataset.appearance='dark';}
