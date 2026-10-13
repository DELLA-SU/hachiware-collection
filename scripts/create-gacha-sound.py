"""Create original, gentle sounds timed to the 2.6-second crane animation."""
import math
import random
import wave
from array import array
from pathlib import Path

rate=44100
samples=[0.0]*round(2.6*rate)
noise=random.Random(17)

def tone(start,duration,f0,f1,volume):
    for i in range(round(duration*rate)):
        time=i/rate
        envelope=math.sin(math.pi*time/duration)**1.5
        phase=2*math.pi*(f0*time+(f1-f0)*time*time/(2*duration))
        index=round(start*rate)+i
        if index<len(samples): samples[index]+=volume*math.sin(phase)*envelope

# Plastic button click, followed by a soft spring.
tone(0,.045,960,180,.18)
tone(.035,.10,390,210,.09)
for i in range(round(.022*rate)):
    samples[i]+=noise.uniform(-.04,.04)*(1-i/(.022*rate))
# Quiet motor hum while the claw travels down and back up.
for i in range(round(1.7*rate)):
    time=i/rate
    phase=2*math.pi*(110*time+15*time*time)
    envelope=math.sin(math.pi*time/1.7)**1.5
    samples[round(.19*rate)+i]+=.027*envelope*(math.sin(phase)+.45*math.sin(phase*2.01))*(.8+.2*math.sin(2*math.pi*12*time))
# Capsule lands at the rectangular outlet; a tiny, bright reward.
tone(1.93,.13,580,170,.14)
tone(2.10,.14,280,590,.11)
tone(2.28,.11,660,660,.075)
tone(2.39,.17,990,1040,.075)

output=Path(__file__).resolve().parents[1]/'public'/'motion-sounds'
output.mkdir(exist_ok=True)
for name,values in [('gacha',samples),('gacha-click',samples[:round(.15*rate)])]:
    peak=max(abs(v) for v in values)
    scale=min(1,.3/peak)
    pcm=array('h',(round(v*scale*32767) for v in values))
    with wave.open(str(output/(name+'.wav')),'wb') as wav:
        wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(pcm.tobytes())
    print(f'{name}: {len(values)/rate:.2f}s, peak {peak*scale:.3f}')
