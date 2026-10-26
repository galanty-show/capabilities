"""原创配乐《Play On · 接着播》：124 BPM、E♭ 大调、33 小节（63.87 秒），纯代码合成，无采样、无第三方素材。

音色引擎沿用同仓库 works/claude-code-promo/music/synth.py（鼓、超锯、拨弦、贝斯、铺底、侧链与混响），
和声、旋律、编排、随机种子全部重写。和弦 E♭ – B♭ – Cm – A♭（I–V–vi–IV），每小节一个，按段落起点循环。

结构（小节，从 0 起；正文 30 小节 = 58.06 秒，其后 3 小节垫在约 4.9 秒的品牌片尾下）：
  0-1   前奏：铺底 + 闷音琶音，第 1 小节起闷底鼓与踩镲
  2-5   铺垫：四拍底鼓、军鼓滚奏 4→8→16→32 分加速、噪声上扬，第 5 小节末拍静音
  6-13  Drop A：底鼓 + 拍手 + 反拍贝斯 + 切分超锯和弦 + 十六分琶音 + 短动机
  14-17 间奏：铺底 + 八分拨弦，无底鼓
  18-21 铺垫二：同 2-5
  22-29 Drop B：Drop A + 高八度主旋律；第 29 小节末拍停顿、反向铺底吸进片尾
  30-32 收尾：冲击 + 长和弦衰减；三声拨弦对齐品牌片尾“播放键弹出 / 结果行落定 / 徽章出现”，铃音落在徽章那一下
用法：.venv-tts/bin/python synth.py <输出.wav>
"""
import sys
import numpy as np
from scipy import signal

SR = 48000
BPM = 124
BEAT = 60 / BPM
BAR = BEAT * 4
BARS = 33
BODY_BARS = 30
LENGTH = BARS * BAR
N = int(round(LENGTH * SR))
rng = np.random.default_rng(20261005)

L = np.zeros(N)
R = np.zeros(N)
bus = {k: [np.zeros(N), np.zeros(N)] for k in ['drums', 'bass', 'synth', 'fx', 'verb']}


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def add(name, start, mono=None, left=None, right=None, pan=0.0):
    i = int(round(start * SR))
    if i >= N:
        return
    if mono is not None:
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        left, right = mono * gl * 1.414, mono * gr * 1.414
    n = min(len(left), N - i)
    bus[name][0][i:i + n] += left[:n]
    bus[name][1][i:i + n] += right[:n]


def env_adsr(n, a=0.005, d=0.1, s=0.7, r=0.1):
    t = np.arange(n) / SR
    total = n / SR
    e = np.where(t < a, t / max(a, 1e-6), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / d, e)
    e = np.where(t >= a + d, s, e)
    rel = np.clip((total - t) / r, 0, 1)
    return e * rel


def saw(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * np.mod(freq * t + phase, 1.0) - 1


def lp(x, cutoff, order=2):
    sos = signal.butter(order, min(cutoff, SR * 0.45), 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def hp(x, cutoff, order=2):
    sos = signal.butter(order, cutoff, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------- 鼓（引擎沿用） ----------
def kick(gain=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t * 300) * 0.35
    return np.tanh((body + click) * 1.6) * 0.95 * gain


def clap(gain=1.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 900, 5000)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        e += np.where(t >= off, np.exp(-(t - off) * (140 if k < 2 else 18)), 0)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.3
    return (noise * e * 0.5 + tone) * gain


def snare(gain=1.0):
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 1200, 8000) * np.exp(-t * 32)
    tone = np.sin(2 * np.pi * 210 * t) * np.exp(-t * 40) * 0.5
    return (noise * 0.6 + tone) * gain


def hat(open_=False, gain=1.0):
    n = int((0.22 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    noise = hp(rng.standard_normal(n), 7000, 4)
    return noise * np.exp(-t * (14 if open_ else 90)) * 0.28 * gain


def crash(gain=1.0):
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    l = hp(rng.standard_normal(n), 4000, 2) * np.exp(-t * 1.7)
    r = hp(rng.standard_normal(n), 4000, 2) * np.exp(-t * 1.7)
    return l * 0.22 * gain, r * 0.22 * gain


def impact(gain=1.0):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 32 + 70 * np.exp(-t * 8)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    return np.tanh(boom * 1.8) * 0.8 * gain


def riser(seconds, gain=1.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    p = t / seconds
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    block = 2048
    for s in range(0, n, block):
        c = 400 * (14000 / 400) ** (p[s] ** 1.6)
        out[s:s + block] = bp(noise[s:s + block], c * 0.7, min(c * 1.3, 20000))
    tone_f = 200 * 2 ** (p * 2.5)
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * 0.12
    return (out * 0.5 + tone) * p ** 2 * gain


def reverse_swell(seconds, freq_list, gain=1.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    x = sum(saw(f * (1 + d), n) for f in freq_list for d in (-0.006, 0.006))
    x = lp(x, 2500)
    return x * (t / seconds) ** 3 * 0.12 * gain


def bell(freq, seconds=1.6, gain=1.0):
    """新增：FM 铃音，用于片尾播放键弹出的那一下。"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * freq * 3.5 * t) * 2.2 * np.exp(-t * 5)
    x = np.sin(2 * np.pi * freq * t + mod)
    return x * np.exp(-t * 3.2) * np.clip(t / 0.003, 0, 1) * 0.35 * gain


# ---------- 和声（新写） ----------
# E♭  B♭  Cm  A♭，每小节一个和弦（I–V–vi–IV）
CHORDS = [[55, 58, 63], [53, 58, 62], [55, 60, 63], [56, 60, 63]]
ROOTS = [39, 46, 48, 44]  # E♭2 B♭2 C3 A♭2
SECTIONS = [(0, 'intro'), (2, 'build'), (6, 'dropA'), (14, 'break'), (18, 'build2'), (22, 'dropB'), (30, 'outro')]


def section(bar):
    name, start = 'intro', 0
    for s, nm in SECTIONS:
        if bar >= s:
            name, start = nm, s
    return name, bar - start


def chord_of(bar):
    _, rel = section(bar)
    return CHORDS[rel % 4], ROOTS[rel % 4]


def supersaw(freqs, seconds, cutoff=5000, voices=7, spread=0.012, gain=1.0):
    n = int(seconds * SR)
    l = np.zeros(n)
    r = np.zeros(n)
    for f in freqs:
        for v in range(voices):
            d = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
            w = saw(f * (1 + d), n, phase=rng.random())
            if v % 2:
                l += w * (0.6 if v != voices // 2 else 1)
            else:
                r += w * (0.6 if v != voices // 2 else 1)
    l, r = lp(l, cutoff), lp(r, cutoff)
    return l * gain / voices, r * gain / voices


def pluck(freq, seconds=0.25, cutoff=3200, gain=1.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    x = saw(freq, n) * 0.6 + saw(freq * 1.004, n) * 0.4
    bright, dark = lp(x, cutoff), lp(x, 500)
    k = np.exp(-t * 18)
    y = bright * k + dark * (1 - k)
    return y * np.exp(-t * 9) * gain


def bass_note(freq, seconds, gain=1.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * freq * t)
    grit = lp(saw(freq, n), 700)
    e = env_adsr(n, 0.004, 0.08, 0.85, 0.03)
    return np.tanh((sub * 0.8 + grit * 0.45) * 1.4) * e * 0.55 * gain


def pad(freqs, seconds, cutoff=1800, gain=1.0):
    l, r = supersaw(freqs, seconds, cutoff=cutoff, voices=5, spread=0.008, gain=1.0)
    n = len(l)
    e = env_adsr(n, 0.35, 0.2, 0.9, 0.5)
    return l * e * 0.35 * gain, r * e * 0.35 * gain


# ---------- 编排（新写） ----------
kick_times = []
ARP = [0, 2, 1, 3, 2, 1, 3, 2]
# Drop A 短动机（两小节一句，给 Drop B 的主旋律埋伏笔）
MOTIF = {0: [(0, 79, 0.5), (0.75, 77, 0.5), (1.5, 75, 0.5)], 1: [(0, 74, 0.5), (0.75, 77, 0.5), (1.5, 82, 0.75)]}
# Drop B 主旋律：G–F–E♭ 下行接 B♭ 上扬，第三小节冲到 C6 再落回 E♭
MELODY = {0: [(0, 79, 1), (1, 77, 0.5), (1.5, 75, 0.5), (2, 79, 1), (3, 82, 1)],
          1: [(0, 77, 1.5), (1.5, 74, 0.5), (2, 77, 1), (3, 79, 1)],
          2: [(0, 75, 1), (1, 79, 1), (2, 84, 1.5), (3.5, 82, 0.5)],
          3: [(0, 80, 1.5), (1.5, 79, 0.5), (2, 77, 1), (3, 75, 1)]}

for bar in range(BODY_BARS):
    sec, rel = section(bar)
    notes, root = chord_of(bar)
    freqs = [midi(m) for m in notes]
    stop = sec == 'dropB' and bar == BODY_BARS - 1  # 正文最后一拍停顿，吸进片尾

    # 铺底
    if sec in ('intro', 'build', 'break', 'build2'):
        cutoff = {'intro': 1000 + rel * 400, 'build': 1400 + rel * 500, 'break': 1700, 'build2': 1800 + rel * 600}[sec]
        l, r = pad(freqs, BAR + 0.4, cutoff=cutoff, gain=1.4 if sec == 'intro' else 1.0)
        add('synth', t_of(bar), left=l, right=r)
    if sec in ('dropA', 'dropB'):
        l, r = pad([f / 2 for f in freqs], BAR + 0.3, cutoff=1300, gain=0.6)
        add('synth', t_of(bar), left=l, right=r)

    # 琶音
    arp_notes = notes + [notes[0] + 12]
    step = 0.5 if sec in ('intro', 'break') else 0.25
    count = int(4 / step)
    for k in range(count):
        if stop and k * step >= 3:
            break
        m = arp_notes[ARP[k % 8]] + 12
        if sec == 'intro':
            cut = 600 + (rel * 4 + k * step) / 8 * 1800
        elif sec in ('build', 'build2'):
            cut = 1500 + (rel * 4 + k * step) / 16 * 5000
        elif sec == 'break':
            cut = 2800
        else:
            cut = 6200
        g = 0.32 if sec in ('dropA', 'dropB') else 0.28
        p = pluck(midi(m), 0.32 if step == 0.25 else 0.5, cut, g)
        add('synth', t_of(bar, k * step), mono=p, pan=(-0.35 if k % 2 else 0.35))
        add('verb', t_of(bar, k * step), mono=p * 0.5, pan=0)

    # 鼓
    if sec in ('build', 'build2', 'dropA', 'dropB'):
        for b in range(4):
            if sec in ('build', 'build2') and rel == 3 and b == 3:
                continue
            if stop and b == 3:
                continue
            add('drums', t_of(bar, b), mono=kick(0.95 if sec.startswith('drop') else 0.8))
            kick_times.append(t_of(bar, b))
    if sec == 'intro' and rel >= 1:
        for b in range(4):
            add('drums', t_of(bar, b), mono=lp(kick(0.55), 300))
    if sec in ('dropA', 'dropB'):
        for b in (1, 3):
            if stop and b == 3:
                continue
            add('drums', t_of(bar, b), mono=clap(0.9), pan=0)
            add('verb', t_of(bar, b), mono=clap(0.35))
        for b in range(4):
            if stop and b == 3:
                continue
            add('drums', t_of(bar, b + 0.5), mono=hat(True, 0.9), pan=0.25)
        for k in range(16):
            if stop and k >= 12:
                break
            if k % 4 != 2:
                add('drums', t_of(bar, k * 0.25), mono=hat(False, 0.55 + 0.3 * (k % 2)), pan=-0.3)
    if (sec == 'intro' and rel >= 1) or sec == 'break':
        for b in range(4):
            add('drums', t_of(bar, b + 0.5), mono=hat(False, 0.8), pan=0.2)
    if sec in ('build', 'build2'):
        stp = [1, 0.5, 0.25, 0.125][rel]
        k = 0
        while k * stp < (3 if rel == 3 else 4):
            pos = rel * 4 + k * stp
            g = 0.25 + 0.75 * pos / 15
            add('drums', t_of(bar, k * stp), mono=snare(g * 0.8), pan=0)
            k += 1
        for b in range(4):
            if not (rel == 3 and b == 3):
                add('drums', t_of(bar, b + 0.5), mono=hat(False, 0.7), pan=0.2)

    # 贝斯
    if sec in ('dropA', 'dropB'):
        for k in range(8):
            if k % 2 == 0 or (stop and k >= 6):
                continue
            m = root + (12 if k in (3, 7) else 0)
            add('bass', t_of(bar, k * 0.5), mono=bass_note(midi(m), BEAT * 0.48, 1.0))
        add('bass', t_of(bar, 0), mono=bass_note(midi(root - 12), BEAT * 0.4, 0.7))
    if sec == 'break':
        add('bass', t_of(bar), mono=bass_note(midi(root), BAR * 0.95, 0.5))

    # 切分超锯和弦（与上一支不同的六连切分）
    if sec in ('dropA', 'dropB'):
        for pos in (0, 0.75, 1.5, 2.25, 3.0, 3.5):
            if stop and pos >= 3:
                continue
            l, r = supersaw(freqs + [freqs[0] * 2], BEAT * 0.38, cutoff=6500, gain=0.9)
            e = env_adsr(len(l), 0.003, 0.05, 0.7, 0.05)
            add('synth', t_of(bar, pos), left=l * e * 0.5, right=r * e * 0.5)
            add('verb', t_of(bar, pos), left=l * e * 0.25, right=r * e * 0.25)

    # Drop A 短动机：第 2、4 拍后半小节一句拨弦
    if sec == 'dropA':
        for pos, m, dur in MOTIF[rel % 2]:
            p = pluck(midi(m), BEAT * dur * 1.6, 5200, 0.42)
            add('synth', t_of(bar, 2 + pos), mono=p, pan=0.1)
            add('verb', t_of(bar, 2 + pos), mono=p * 0.6)

    # 主旋律（Drop B）
    if sec == 'dropB':
        for pos, m, dur in MELODY[rel % 4]:
            if stop and pos >= 3:
                continue
            l, r = supersaw([midi(m), midi(m + 12) * 0.5], BEAT * dur * 0.95, cutoff=7000, voices=5, spread=0.01, gain=1.0)
            e = env_adsr(len(l), 0.01, 0.1, 0.8, 0.08)
            add('synth', t_of(bar, pos), left=l * e * 0.42, right=r * e * 0.42)
            add('verb', t_of(bar, pos), left=l * e * 0.3, right=r * e * 0.3)

# 过渡效果
for b0 in (2, 18):
    add('fx', t_of(b0), mono=riser(4 * BAR - BEAT, 0.9))
    s_notes, _ = chord_of(b0 + 3)
    add('fx', t_of(b0 + 3), mono=reverse_swell(3 * BEAT, [midi(m) for m in s_notes], 0.9))
for b0 in (6, 22, 30):
    add('fx', t_of(b0), mono=impact(1.0))
    l, r = crash(1.0)
    add('fx', t_of(b0), left=l, right=r)
add('fx', t_of(14), mono=impact(0.6))
l, r = crash(0.6)
add('fx', t_of(14), left=l, right=r)
add('fx', t_of(0), mono=riser(2 * BAR, 0.35))
# 正文最后一拍：反向铺底吸进片尾冲击
add('fx', t_of(BODY_BARS - 1, 3), mono=reverse_swell(BEAT, [midi(m) for m in [63, 67, 70]], 1.4))

# 收尾（品牌片尾下方）：E♭add9 长和弦衰减
l, r = supersaw([midi(m) for m in [63, 67, 70, 77]] + [midi(51)], 3 * BAR, cutoff=4200, voices=7, gain=1.0)
n = len(l)
tt = np.arange(n) / SR
e = np.exp(-tt * 0.9) * np.clip((3 * BAR - tt) / 0.8, 0, 1)
add('synth', t_of(30), left=l * e * 0.6, right=r * e * 0.6)
add('verb', t_of(30), left=l * e * 0.6, right=r * e * 0.6)
add('bass', t_of(30), mono=bass_note(midi(27), 3 * BAR * 0.9, 0.8) * np.exp(-np.arange(int(3 * BAR * 0.9 * SR)) / SR * 0.7))
# 对齐品牌片尾 made-with v3（src/brand/MadeWithOutro.tsx，4.9 秒）：播放键 0.56–0.86 秒弹出、结果行约 3.0 秒落定、
# 徽章 4.06 秒（STORE_SETTLE_SECONDS）硬切出现。三声拨弦落在这三处，铃音和第三声一起落在徽章那一下。
# 管线在全片最后 1.5 秒统一淡出床乐，徽章那一下已在淡出段里，所以铃音略加重。
outro0 = t_of(30)
# 第一声落在片尾冲击与长和弦最响的时候，稍加重才听得出来。
for off, m, g in ((0.62, 79, 0.5), (3.0, 82, 0.36), (4.06, 87, 0.36)):
    p = pluck(midi(m), 0.5, 4200, g)
    add('synth', outro0 + off, mono=p, pan=0)
    add('verb', outro0 + off, mono=p * 0.7)
add('synth', outro0 + 4.06, mono=bell(midi(87), 2.0, 1.5) + bell(midi(94), 2.0, 0.6))
add('verb', outro0 + 4.06, mono=bell(midi(87), 2.0, 1.0))

# ---------- 混音（引擎沿用） ----------
duck = np.ones(N)
tt = np.arange(int(0.4 * SR)) / SR
shape = 1 - 0.75 * np.exp(-tt / 0.09)
for kt in kick_times:
    i = int(round(kt * SR))
    n = min(len(shape), N - i)
    duck[i:i + n] = np.minimum(duck[i:i + n], shape[:n])

ir_n = int(2.2 * SR)
ir_t = np.arange(ir_n) / SR
ir_l = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.6)
ir_r = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.6)
ir_l, ir_r = lp(ir_l, 6000), lp(ir_r, 6000)
ir_l /= np.sqrt(np.sum(ir_l ** 2))
ir_r /= np.sqrt(np.sum(ir_r ** 2))
verb_in = [hp(x, 300) for x in bus['verb']]
verb = [signal.fftconvolve(verb_in[0], ir_l)[:N], signal.fftconvolve(verb_in[1], ir_r)[:N]]

gains = {'drums': 0.9, 'bass': 0.9, 'synth': 1.0, 'fx': 0.7}
for ch in (0, 1):
    mix = bus['drums'][ch] * gains['drums'] + bus['fx'][ch] * gains['fx']
    mix += (bus['bass'][ch] * gains['bass'] + bus['synth'][ch] * gains['synth'] + verb[ch] * 0.35) * duck
    if ch == 0:
        L = mix
    else:
        R = mix

stereo = np.stack([L, R], axis=1)
stereo = signal.sosfilt(signal.butter(2, 28, 'high', fs=SR, output='sos'), stereo, axis=0)
stereo *= 0.6 / np.max(np.abs(stereo))
stereo = np.tanh(stereo * 1.5) / np.tanh(1.5)
fade = int(0.01 * SR)
stereo[:fade] *= np.linspace(0, 1, fade)[:, None]
tail = int(0.8 * SR)
stereo[-tail:] *= np.linspace(1, 0, tail)[:, None] ** 2

out = sys.argv[1] if len(sys.argv) > 1 else 'play-on.wav'
from scipy.io import wavfile
wavfile.write(out, SR, (stereo * 32767 * 0.95).astype(np.int16))
print(f'{out}: {LENGTH:.3f}s, {BARS} bars @ {BPM} BPM (body {BODY_BARS * BAR:.3f}s)')
