document.addEventListener('DOMContentLoaded', function(){
  try{ console.log('bgAudio: script loaded and DOMContentLoaded'); }catch(_){}
  const audio = document.getElementById('bgAudio');
  const toggle = document.getElementById('audioToggle');
  if(!audio || !toggle) return;

  // restore saved state
  const savedMuted = localStorage.getItem('bgAudioMuted');
  const savedVolume = parseFloat(localStorage.getItem('bgAudioVolume'));
  const savedTime = parseFloat(localStorage.getItem('bgAudioTime'));
  // To satisfy autoplay policies, start playback muted. We'll restore volume if present.
  audio.volume = (isFinite(savedVolume) ? savedVolume : 0.25);
  audio.playsInline = true;
  let unmuteOnGesture = false;
  if(savedMuted === 'true'){
    audio.muted = true;
    toggle.textContent = '🔇';
  } else if(savedMuted === 'false'){
    // user previously wanted sound — start muted and unmute on first gesture
    audio.muted = true;
    unmuteOnGesture = true;
    toggle.textContent = '🔊';
  } else {
    // no preference: start muted but indicate sound icon (will unmute on gesture)
    audio.muted = true;
    toggle.textContent = '🔊';
  }

  // Volume slider (if present)
  const volumeSlider = document.getElementById('audioVolume');
  if(volumeSlider){
    volumeSlider.value = audio.volume;
    volumeSlider.addEventListener('input', ()=>{
      const v = parseFloat(volumeSlider.value);
      if(!isFinite(v)) return;
      audio.volume = v;
      try{ localStorage.setItem('bgAudioVolume', audio.volume.toString()); }catch(_){ }
      if(audio.muted){
        audio.muted = false;
        try{ localStorage.setItem('bgAudioMuted', 'false'); }catch(_){ }
        if(toggle) toggle.textContent = '🔊';
      }
      // ensure playback after changing volume (some browsers require gesture)
      audio.play().catch(()=>{});
    });
  }

  // try to autoplay; if not allowed, wait for user interaction
  const tryPlay = ()=>{
    audio.play().catch((e)=>{ try{ console.debug('bgAudio play failed', e); }catch(_){} });
  };

  // Restore time when metadata is available
  if(!isNaN(savedTime) && isFinite(savedTime)){
    audio.addEventListener('loadedmetadata', ()=>{
      try{
        if(savedTime > 0 && savedTime < audio.duration){
          audio.currentTime = savedTime;
        }
      }catch(_){ }
    });
  }

  // Periodically persist currentTime so navigation resumes close to where it left off
  const persistTime = ()=>{
    try{ localStorage.setItem('bgAudioTime', audio.currentTime.toString()); }catch(_){ }
  };
  const persistInterval = setInterval(persistTime, 5000);
  // ensure we save on page hide/unload
  const saveOnUnload = ()=>{ persistTime(); clearInterval(persistInterval); };
  window.addEventListener('beforeunload', saveOnUnload);
  window.addEventListener('pagehide', saveOnUnload);

  // Start playback muted to satisfy autoplay rules
  tryPlay();

  // If user wanted sound previously (unmuteOnGesture) then unmute at first gesture.
  const onGesture = ()=>{
    tryPlay();
    if(unmuteOnGesture && audio.muted){
      audio.muted = false;
      localStorage.setItem('bgAudioMuted', 'false');
      toggle.textContent = '🔊';
    }
    window.removeEventListener('click', onGesture);
    window.removeEventListener('keydown', onGesture);
  };
  window.addEventListener('click', onGesture);
  window.addEventListener('keydown', onGesture);

  toggle.addEventListener('click', ()=>{
    try{ console.log('bgAudio: toggle clicked (direct)'); }catch(_){}
    // toggle mute state; ensure playback is underway
    const willUnmute = audio.muted;
    audio.muted = !audio.muted;
    try{ localStorage.setItem('bgAudioMuted', audio.muted ? 'true' : 'false'); }catch(_){ }
    toggle.textContent = audio.muted ? '🔇' : '🔊';
    tryPlay();
    // if we just unmuted, try to play unmuted (some browsers require a gesture)
    if(willUnmute){
      audio.play().catch((e)=>{ try{ console.log('bgAudio play on toggle failed', e); }catch(_){} });
    }
  });

  // Delegated handler: in case the navbar is re-rendered or the button is moved,
  // catch clicks on any element matching the toggle id.
  document.addEventListener('click', function(e){
    const el = e.target.closest ? e.target.closest('#audioToggle') : (e.target.id==='audioToggle' ? e.target : null);
    if(!el) return;
    try{ console.log('bgAudio: toggle clicked (delegated)'); }catch(_){}
    // keep same behavior as above
    const willUnmute = audio.muted;
    audio.muted = !audio.muted;
    try{ localStorage.setItem('bgAudioMuted', audio.muted ? 'true' : 'false'); }catch(_){ }
    if(toggle) toggle.textContent = audio.muted ? '🔇' : '🔊';
    tryPlay();
    if(willUnmute){
      audio.play().catch((e)=>{ try{ console.log('bgAudio play on delegated toggle failed', e); }catch(_){} });
    }
  });
  // clean up if script is removed
  window.addEventListener('unload', ()=>{ try{ clearInterval(persistInterval); }catch(_){ } });
});
