/* Progressive, scroll-triggered timeline reveal on the dedicated Our Story page. */
(()=>{'use strict';const root=document.documentElement,timeline=document.querySelector('.h3-story-full .home-timeline');if(!timeline)return;
const items=[...timeline.querySelectorAll('.home-milestone')],reduce=matchMedia('(prefers-reduced-motion: reduce)');
const off=()=>reduce.matches||root.classList.contains('motion-paused');let observer;
function showAll(){items.forEach(n=>n.classList.add('in-view'));observer?.disconnect();}
if(!off()&&'IntersectionObserver'in window){timeline.classList.add('is-observed');observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target);}}),{threshold:.12});items.forEach(n=>observer.observe(n));}else showAll();
new MutationObserver(()=>{if(off())showAll();}).observe(root,{attributes:true,attributeFilter:['class']});reduce.addEventListener('change',()=>{if(off())showAll();});
window.BW_STORY_H3={version:'H3',years:items.map(n=>n.dataset.year),scope:'Existing complete hospitality journey moved from home to Our Story.'};})();
