"use strict";
/* MASALTI FINAL · Gerçek #masal bağlantıları sayesinde JavaScript olmadan da okunur. */
(function(){
 const root=document.documentElement;
 const cards=Array.from(document.querySelectorAll('article.card'));
 const stories=Array.from(document.querySelectorAll('article.story'));
 const titles=cards.map(c=>c.querySelector('h3').textContent.trim());
 // Reuse embedded artwork from the original image elements instead of embedding it twice.
 stories.forEach((story,i)=>{const bg=story.querySelector('.story-backdrop-image'),cover=story.querySelector('.story-cover img');if(bg&&cover)bg.src=cover.src;});
 const store={read:[],saved:[],font:20,night:false};
 let filter='all', selected=-1,homeScrollY=0,lastWasStory=false,homeScrollFrozen=false,toastTimer=null;
 const search=document.getElementById('search');
 const hero=document.querySelector('#home .hero');
 const heroImage=document.getElementById('heroImage'),heroBlur=document.getElementById('heroBlur');
 const firstImg=heroImage.src;
 const homeStateKey='masalti-home-v3';
 try {
   const old=JSON.parse(localStorage.getItem('masalti-v3')||localStorage.getItem('masalti-v2')||localStorage.getItem('masalti-v1')||'{}');
   for(const k of ['read','saved']) if(Array.isArray(old[k]))store[k]=Array.from(new Set(old[k].filter(v=>Number.isInteger(v)&&v>=0&&v<10)));
   store.font=Math.max(17,Math.min(26,Number(old.font)||20));
   store.night=!!old.night;
 }catch(e){}
 try {const x=JSON.parse(sessionStorage.getItem(homeStateKey)||'{}');filter=['all','saved','unread'].includes(x.filter)?x.filter:'all';search.value=typeof x.query==='string'?x.query:'';homeScrollY=Number(x.scrollY)||0;}catch(e){}
 function persist(){try{localStorage.setItem('masalti-v3',JSON.stringify(store));return true}catch(e){return false}}
 function persistHome(){try{sessionStorage.setItem(homeStateKey,JSON.stringify({query:search.value,filter,scrollY:homeScrollY}));}catch(e){}}
 function toast(msg){const node=document.getElementById('toast');node.textContent=msg;node.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{node.hidden=true;},2800)}
 function norm(s){return (s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')}
 function refresh(){
   const q=norm(search.value);let count=0;
   cards.forEach((c,i)=>{
     const show=norm(c.dataset.search).includes(q)&&(filter!=='saved'||store.saved.includes(i))&&(filter!=='unread'||!store.read.includes(i));
     c.hidden=!show;if(show)count++;
     c.querySelector('.status').hidden=!store.read.includes(i);
     c.querySelector('.saved-flag').hidden=!store.saved.includes(i);
   });
   document.getElementById('resultCount').textContent=count+' masal';
   document.getElementById('empty').hidden=!!count;
   document.getElementById('readingCount').textContent=store.read.length+' / 10 masal okundu';
   document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
   document.querySelectorAll('[data-save]').forEach(b=>{
     const on=store.saved.includes(Number(b.dataset.save));
     b.setAttribute('aria-pressed',String(on)); b.textContent=on?'✓ Kaydedildi':'Kaydet';
   });
   document.querySelectorAll('[data-read]').forEach(b=>{
     const on=store.read.includes(Number(b.dataset.read));b.setAttribute('aria-pressed',String(on));
     b.textContent=on?'✓ Okundu · geri al':'Bu masalı okudum ✓';
   });
   root.style.setProperty('--read',store.font+'px');
   document.querySelectorAll('[data-font]').forEach(b=>{b.disabled=Number(b.dataset.font)<0?store.font<=17:store.font>=26});
   root.classList.toggle('night',store.night);
   document.querySelectorAll('[data-night]').forEach(b=>{b.setAttribute('aria-pressed',String(store.night));b.textContent=store.night?'☀ Gündüz':'☾ Gece'});
   persistHome();
 }
 function select(n){
   selected=n>9?-1:n< -1?9:n;
   const intro=selected===-1;
   const c=intro?null:cards[selected],src=intro?firstImg:c.querySelector('img').src;
   heroImage.src=src;heroBlur.src=src;
   heroImage.alt=intro?'Masal dünyasından çizimlerin oluşturduğu özel karşılama illüstrasyonu':titles[selected]+' — masal kapak çizimi';
   hero.dataset.slide=intro?'intro':'story';
   if(intro)hero.removeAttribute('data-font-story');else hero.setAttribute('data-font-story',String(selected));
   document.getElementById('heroEyebrow').textContent=intro?'MASALTI  /  RESİMLİ MASAL KOLEKSİYONU':String(selected+1).padStart(2,'0')+' / 10 · '+c.querySelector('.category').textContent.trim();
   document.getElementById('heroTitle').innerHTML=intro?'<span class="intro-line">Bir varmış.</span><span class="intro-line intro-accent">Bir de sen.</span>':'';
   if(!intro)document.getElementById('heroTitle').textContent=titles[selected];
   document.getElementById('heroDescription').textContent=intro?'Kurnaz tilkiler, gizli yüzükler, uzak diyarlar… Bir masal seç; gerisini hikâye anlatsın.':c.querySelector('.card-body>p').textContent.trim();
   document.getElementById('heroName').textContent=intro?'SAYFAYI ÇEVİR, MASAL BAŞLASIN':titles[selected].toLocaleUpperCase('tr-TR');
   document.getElementById('heroNumber').textContent=intro?'00 / 10':String(selected+1).padStart(2,'0')+' / 10';
   const link=document.getElementById('heroRead');link.href=intro?'#masallar':'#masal-'+selected;
   link.innerHTML=intro?'Masal kapısını aç <span aria-hidden="true">↗</span>':'Hemen oku <span aria-hidden="true">↗</span>';
   const saved=document.getElementById('heroSave');saved.hidden=intro;
   if(!intro){saved.dataset.save=String(selected);saved.textContent=store.saved.includes(selected)?'✓ Kaydedildi':'Kaydet';saved.setAttribute('aria-pressed',String(store.saved.includes(selected)));}
   document.getElementById('heroPrev').disabled=intro;
   document.getElementById('heroNext').disabled=false;
   document.getElementById('heroHint').textContent=intro?'ON MASAL  •  KIRK RESİMLİ SAHNE  •  İNTERNETSİZ OKU':'Masal '+String(selected+1).padStart(2,'0')+' / 10 · Okumaya hazır';
 }
 function updateProgress(){const story=document.querySelector('.story:target');if(!story)return;const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);story.querySelector('.progress').style.width=Math.max(0,Math.min(100,scrollY/range*100))+'%'}
 function route(){
   const target=document.getElementById(location.hash.substring(1));
   if(target?.tagName==='DETAILS')target.open=true;
   const current=document.querySelector('.story:target');
   document.title=current?current.dataset.title+' — Masaltı':'Masaltı — Bir kapı, on masal';
   if(current){homeScrollFrozen=true;window.scrollTo({top:0,behavior:'instant'});current.querySelector('h1').focus({preventScroll:true});lastWasStory=true;}
   else if(lastWasStory){lastWasStory=false;const restore=homeScrollY||document.getElementById('masallar').offsetTop-90;requestAnimationFrame(()=>{window.scrollTo({top:restore,behavior:'instant'});requestAnimationFrame(()=>{homeScrollFrozen=false;});});}
   updateProgress();
 }
 function preserveHome(){if(!document.querySelector('.story:target')){homeScrollY=window.scrollY;homeScrollFrozen=true;persistHome();}}
 // Return to the exact collection position even after browser back / internal navigation.
 document.querySelectorAll('a[href^="#masal-"]').forEach(a=>a.addEventListener('click',preserveHome));
 document.querySelectorAll('.reader-bar>a[href="#masallar"],.end a[href="#masallar"]').forEach(a=>a.addEventListener('click',()=>{lastWasStory=true;}));
 search.addEventListener('input',refresh);
 document.addEventListener('click',ev=>{
   const b=ev.target.closest('button');
   if(!b)return;
   if(b.hasAttribute('data-filter')){filter=b.dataset.filter;refresh();}
   if(b.hasAttribute('data-save')){
     const i=Number(b.dataset.save);store.saved=store.saved.includes(i)?store.saved.filter(x=>x!==i):store.saved.concat(i);
     const kept=persist();refresh();toast(kept?(store.saved.includes(i)?'Masal kaydedildi.':'Kayıt kaldırıldı.'):'Kayıt bu oturumda tutuluyor.');
   }
   if(b.hasAttribute('data-read')){const i=Number(b.dataset.read);store.read=store.read.includes(i)?store.read.filter(x=>x!==i):store.read.concat(i);persist();refresh();toast('Okuma durumun güncellendi.');}
   if(b.hasAttribute('data-font')){store.font=Math.max(17,Math.min(26,store.font+Number(b.dataset.font)));persist();refresh();}
   if(b.hasAttribute('data-night')){store.night=!store.night;persist();refresh();}
   if(b.hasAttribute('data-step'))select(selected+Number(b.dataset.step));
   if(b.hasAttribute('data-jump'))document.getElementById(b.dataset.jump)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
   if(b.id==='randomStory'){preserveHome();location.hash='masal-'+Math.floor(Math.random()*cards.length)}
   if(b.id==='resetSearch'){search.value='';filter='all';refresh()}
   if(b.id==='clearProgress'&&confirm('Bu tarayıcıdaki ayraçlar ve okundu işaretleri silinsin mi?')){store.read=[];store.saved=[];persist();refresh();toast('Okuma kayıtları sıfırlandı.')}
   if(b.hasAttribute('data-zoom')){const i=Number(b.dataset.zoom);openImage(cards[i].querySelector('img'));}
 });
 const dialog=document.getElementById('imageDialog');const dialogImg=document.getElementById('dialogImage');
 function openImage(img){if(!img||!dialog.showModal)return;dialogImg.src=img.currentSrc||img.src;dialogImg.alt=img.alt||'Masal çizimi';document.getElementById('dialogCaption').textContent=img.alt||'Masal çizimi';dialog.showModal();}
 function closeImage(){dialog.close();dialogImg.removeAttribute('src')}
 dialog.querySelector('.dialog-close').addEventListener('click',closeImage);
 dialog.addEventListener('click',e=>{if(e.target===dialog)closeImage()});
 for(const img of document.querySelectorAll('.chapter figure img,.story-cover img,#heroImage')){
   img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',(img.alt||'Masal çizimi')+' — büyük görüntüle');
   img.addEventListener('click',()=>openImage(img));
   img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openImage(img)}});
 }
 window.addEventListener('hashchange',route);
 window.addEventListener('scroll',()=>{updateProgress();if(!document.querySelector('.story:target')&&!homeScrollFrozen){homeScrollY=window.scrollY;}},{passive:true});
 window.addEventListener('resize',updateProgress);
 document.addEventListener('keydown',e=>{
   const typing=e.target.closest?.('input,textarea,select,[contenteditable]');
   if(typing)return;
   if(e.key==='Escape'&&!dialog.open&&document.querySelector('.story:target')){location.hash='masallar';}
   if(!document.querySelector('.story:target')&&!dialog.open&&hero.getBoundingClientRect().bottom>0&&hero.getBoundingClientRect().top<innerHeight){
     if(e.key==='ArrowRight'&&!document.getElementById('heroNext').disabled){e.preventDefault();select(selected+1)}
     if(e.key==='ArrowLeft'&&!document.getElementById('heroPrev').disabled){e.preventDefault();select(selected-1)}
   }
 });
 window.addEventListener('pagehide',()=>{if(!document.querySelector('.story:target'))persistHome()});
 select(-1);refresh();root.classList.add('enhanced');route();
})();
