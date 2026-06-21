/* Responsive birthday experience interaction
   - Password: 21062000
   - Gracefully handles missing assets (console warnings)
*/
(function(){
  const PASSWORD = '21062000'
  const pinDisplay = document.getElementById('pin-display')
  const numPad = document.getElementById('num-pad')
  const stages = ['stage-login','stage-cake','stage-letter','stage-farewell']
  let input = ''
  let bgAudio = null
  let farewellAudio = null

  // create numeric keypad
  const keys = ['1','2','3','4','5','6','7','8','9','←','0','OK']
  keys.forEach(k=>{
    const btn = document.createElement('button')
    btn.textContent = k
    btn.addEventListener('click', ()=>onKey(k))
    numPad.appendChild(btn)
  })

  function onKey(k){
    if(k === '←'){ input = input.slice(0,-1) }
    else if(k === 'OK'){ checkPin() }
    else { if(input.length<12) input+=k }
    pinDisplay.textContent = input ? input.replace(/./g,'•') : '••••••••'
  }

  function showStage(id){
    document.querySelectorAll('.stage').forEach(s=>s.classList.remove('stage--active'))
    document.getElementById(id).classList.add('stage--active')
  }

  function checkPin(){
    if(input === PASSWORD){
      // create and play background music as part of the user gesture
      try{
        bgAudio = new Audio('assets/background-music.mp3')
        bgAudio.loop = true
        bgAudio.volume = 0.7
        bgAudio.play().catch(()=>console.warn('background-music.mp3 no disponible'))
      }catch(e){ console.warn('background-music init failed', e) }

      runConfetti();
      setTimeout(()=>showStage('stage-cake'),900)
      startCakeSequence()
    } else {
      flashLogin()
      input = ''
      pinDisplay.textContent = '••••••••'
    }
  }

  function flashLogin(){
    const card = document.querySelector('.login-card')
    card.animate([{transform:'translateY(0)'},{transform:'translateY(-8px)'},{transform:'translateY(0)'}],{duration:350})
  }

  /* Confetti - simple particle burst */
  function runConfetti(){
    const canvas = document.getElementById('confetti-canvas')
    const ctx = canvas.getContext('2d')
    function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
    resize();window.addEventListener('resize',resize)
    const pieces = []
    for(let i=0;i<120;i++) pieces.push({x:innerWidth/2,y:0,vy:Math.random()*6+2, vx:(Math.random()-0.5)*8, r:Math.random()*8+4, color: ['#A7C7E7','#B8E0D2','#CDB4DB','#FFD59E'][Math.floor(Math.random()*4)]})
    let t=0
    const id = setInterval(()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height)
      pieces.forEach(p=>{p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.r, p.r*0.6)})
      t++
      if(t>160){ clearInterval(id); ctx.clearRect(0,0,canvas.width,canvas.height) }
    },16)
  }

  /* Cake sequence: light candle, play music, show note */
  function startCakeSequence(){
    const cakeGif = document.getElementById('cake-gif')
    // ensure gif visible (in case it was hidden)
    if(cakeGif) cakeGif.style.opacity = 1
    // ensure LISTO triggers the next step (use global bgAudio)
    const btn = document.getElementById('btn-listo')
    const notePara = document.querySelector('#note p')
    if(btn){
      btn.addEventListener('click', ()=>{
        // stop background immediately when user clicks LISTO
        try{ if(bgAudio && !bgAudio.paused) bgAudio.pause() }catch(e){/* ignore */}
        // remove the message paragraph if exists
        if(notePara) notePara.remove()
        // show envelope modal with uploaded image; continue sequence after closing
        const envModal = document.getElementById('envelope-modal')
        const envImg = document.getElementById('envelope-img')
        if(envModal && envImg){
          envImg.src = 'assets/envelope.png'
          envModal.classList.remove('hidden')
          // clicking the image opens the letter page in a new tab/window
          envImg.onclick = ()=>{
            try{ window.open('letter.html','_blank') }catch(e){ window.open('letter.html') }
            envModal.classList.add('hidden')
          }
          document.getElementById('envelope-close').onclick = ()=>{
            envModal.classList.add('hidden')
            // fallback: if user closes modal without opening letter, continue sequence
            setTimeout(()=> blowCandle(), 180)
          }
        } else {
          // fallback: proceed directly
          blowCandle()
        }
      })
    }
  }

  function blowCandle(){
    // play sizzle
    try{ new Audio('assets/candle-sizzle.mp3').play() }catch(e){console.warn('candle-sizzle.mp3 no disponible')}
    // fade out the gif (visual 'blow')
    const cakeGif = document.getElementById('cake-gif')
    if(cakeGif){
      cakeGif.animate([{opacity:1},{opacity:0}],{duration:900,fill:'forwards'})
    }
    setTimeout(()=>{
      try{ if(bgAudio && !bgAudio.paused) bgAudio.pause() }catch(e){/* ignore */}
      showStage('stage-letter')
      openEnvelope()
    },1000)
  }

  /* Envelope -> typing effect */
  function openEnvelope(){
    try{ new Audio('assets/paper-open.mp3').play() }catch(e){console.warn('paper-open.mp3 no disponible')}
    const text = `Querida persona querida,\n\nQue tus deseos se hagan realidad.\nTe mando todo mi cariño en este día tan especial.`
    const out = document.getElementById('typed-text')
    let i=0
    const iv = setInterval(()=>{
      out.textContent = text.slice(0,i)
      i++
      if(i>text.length){ clearInterval(iv); document.getElementById('open-gift').classList.remove('hidden') }
    },36)
    document.getElementById('open-gift').addEventListener('click', ()=>{
      // gallery removed — go to farewell instead
      showStage('stage-farewell')
    })
  }

  /* Gallery removed: fragments, swipe, playlist and related handlers deleted */
  // click video to open modal (keep modal behavior if present)
  const modalCloseEl = document.getElementById('modal-close')
  if(modalCloseEl) modalCloseEl.addEventListener('click', ()=>{
    const modal = document.getElementById('modal')
    const v = document.getElementById('gift-video')
    v.pause(); v.currentTime = 0; v.src=''
    modal.classList.add('hidden')
  })

  // BYE button (appears after video ends) - handler added when created

  // initial: bind simple behaviors (modal close already handled above)

  // small accessibility: Enter key checks
  window.addEventListener('keydown',(e)=>{ if(e.key==='Enter') checkPin() })

  // Expose runConfetti for external debug
  window._runConfetti = runConfetti
  // Called by letter.html when user clicks "ABRE TU REGALO" there
  window.openGiftFromLetter = function(){
    // fade GIF and then play the uploaded video inline on the farewell stage
    const cakeGif = document.getElementById('cake-gif')
    if(cakeGif){ cakeGif.animate([{opacity:1},{opacity:0}],{duration:700,fill:'forwards'}) }
    setTimeout(()=>{
      // ensure farewell stage is active and prepare elements
      showStage('stage-farewell')
      const title = document.getElementById('farewell-text')
      const sub = document.getElementById('farewell-subtext')
      const v = document.getElementById('farewell-video')
      const img = document.getElementById('farewell-img')
      const byeBtn = document.getElementById('bye')

      if(img) img.classList.add('hidden')
      if(byeBtn) byeBtn.classList.add('hidden')

      if(title) title.classList.remove('hidden')
      if(v){
        v.classList.remove('hidden')
        if(sub) sub.classList.remove('hidden')
        v.src = 'assets/video-felicitation.mp4'
        v.play().catch(()=>console.warn('video-felicitation.mp4 no disponible o bloqueado'))

        v.onended = ()=>{
          try{ v.pause(); v.currentTime = 0 }catch(e){}
          v.src = ''
          v.classList.add('hidden')
          if(sub) sub.classList.add('hidden')
          if(img) img.classList.remove('hidden')
          if(byeBtn){
            byeBtn.classList.remove('hidden')
            // start background music for farewell image
            try{
              farewellAudio = new Audio('assets/Epiphany.mp3')
              farewellAudio.loop = true
              farewellAudio.volume = 0.7
              farewellAudio.play().catch(()=>console.warn('Epiphany.mp3 no disponible o bloqueado'))
            }catch(e){ console.warn('farewell audio init failed', e) }

            byeBtn.onclick = ()=>{
              if(img) img.classList.add('hidden')
              byeBtn.classList.add('hidden')
              if(title) title.classList.add('hidden')
              if(sub) sub.classList.add('hidden')
              try{ if(bgAudio && !bgAudio.paused){ bgAudio.pause(); bgAudio.currentTime = 0 } }catch(e){}
              try{ if(farewellAudio && !farewellAudio.paused){ farewellAudio.pause(); farewellAudio.currentTime = 0 } }catch(e){}
              input = ''
              pinDisplay.textContent = '••••••••'
              showStage('stage-login')
            }
          }
        }
      }
    },800)
  }

  // Handle ?open=gallery fallback when index.html is loaded directly
  try{
    const params = new URLSearchParams(window.location.search)
    const openParam = params.get('open')
    if(openParam === 'gallery' || openParam === 'farewell'){
      setTimeout(()=>{ showStage('stage-farewell') }, 120)
    }
  }catch(e){}

})();
