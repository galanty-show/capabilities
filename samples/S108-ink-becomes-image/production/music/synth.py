"""原创配乐《落笔》：96 BPM、D 羽调五声（D F G A C）、11 小节加 0.4 小节余响（28.5 秒），纯代码合成，无采样、无第三方素材。

音色全部用加法/减法合成：古筝（加法泛音 + 拨弦噪声 + 按滑）、琵琶轮指、笛、箫、大鼓、堂鼓、大锣、木鱼、编钟、水滴、毛笔扫纸声；
弦乐铺底与冲击、上扬沿用 works/claude-code-promo 的引擎写法。

结构（小节从 0 起；一拍 0.625 秒，一小节 2.5 秒，画面同一张网格）：
  0     墨滴：0.625 秒水滴落纸 + 低鼓，古筝下行刮奏，箫起
  1     落笔：“文”三笔、“影”九笔，每一笔一声扫纸 + 一个古筝音（“影”九笔是一串上行五声）
  2     钤印：第 2 小节第 1 拍大鼓 + 编钟；第 3 拍起古筝上行刮奏，“文影”退到左侧
  3-4   诗一：每字一个十六分古筝音写出两行；第 4 小节第 1 拍大鼓 + 呼啸，字化成画；笛子主题
  5-6   诗二：同上，第 6 小节第 1 拍字化成画
  7     修改：木鱼点选、木鱼两下打字
  8     第 1 拍改成落日（大鼓 + 下行刮奏），随后大鼓加速 + 琵琶轮指上行 + 上扬，末八分静音
  9     Drop：冲击 + 大锣 + 鼓群 + 笛子高音主题；第 3 拍钤印编钟
  10    收：第 1 拍大锣，旋律落回 D，古筝下行刮奏，余响到 28.5 秒
用法：.venv-tts/bin/python synth.py <输出.wav>

S108 随包器乐版（2026-10-07 由 works/ink-promo/music/synth.py 复制）：编排、音色与节拍一字未改，只去掉了人声混音与说话时的
配乐让位——随包样片的朗读是单独一轨（旁白种子），由工作台按 settings.musicDuckDb 闪避配乐。时间表 timeline.json 与原片相同
（tools/plan.py 按实测配音时长排出，68.5 秒），样片各幕的停留与句间停顿就是按这张表配的。
"""
import sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 96
BEAT = 60 / BPM
BAR = BEAT * 4
import json as _json, os as _os
HERE = _os.path.dirname(_os.path.abspath(__file__))
TL = _json.load(open(_os.path.join(HERE, 'timeline.json'), encoding='utf-8'))  # 原片 tools/plan.py 生成，去掉了人声文件列表
LENGTH = TL['length']
N = int(round(LENGTH * SR))
rng = np.random.default_rng(20261007)

bus = {k: [np.zeros(N), np.zeros(N)] for k in ['drums', 'inst', 'pad', 'fx', 'verb']}
events = []  # (秒, 名称)：写进 cues.json，画面对齐用


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def add(name, start, mono=None, left=None, right=None, pan=0.0):
    i = int(round(start * SR))
    if i >= N or i < 0:
        return
    if mono is not None:
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        left, right = mono * gl * 1.414, mono * gr * 1.414
    n = min(len(left), N - i)
    bus[name][0][i:i + n] += left[:n]
    bus[name][1][i:i + n] += right[:n]


def lp(x, cutoff, order=2):
    return signal.sosfilt(signal.butter(order, min(cutoff, SR * 0.45), 'low', fs=SR, output='sos'), x)


def hp(x, cutoff, order=2):
    return signal.sosfilt(signal.butter(order, cutoff, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos'), x)


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def env_adsr(n, a=0.005, d=0.1, s=0.7, r=0.1):
    t = np.arange(n) / SR
    total = n / SR
    e = np.where(t < a, t / max(a, 1e-6), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / d, e)
    e = np.where(t >= a + d, s, e)
    return e * np.clip((total - t) / r, 0, 1)


def saw(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * np.mod(freq * t + phase, 1.0) - 1


# ---------- 弹拨：古筝 / 琵琶 ----------
def zheng(freq, seconds=1.6, gain=1.0, bright=1.0, bend=None):
    """加法古筝：拨弦位置 0.13 的泛音分布、高次泛音衰减更快、轻微非谐、起音噪声；bend=(半音, 起点秒, 时长) 做按滑。"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ratio = np.ones(n)
    if bend:
        semis, b0, bl = bend
        ratio = 2 ** (semis * np.clip((t - b0) / bl, 0, 1) ** 0.7 / 12)
    phase = 2 * np.pi * np.cumsum(freq * ratio) / SR
    x = np.zeros(n)
    for k in range(1, 14):
        if k * freq > 16000:
            break
        a = abs(np.sin(np.pi * k * 0.13)) / k ** (1.05 - 0.25 * bright)
        decay = 1.6 + 0.9 * k / bright
        x += a * np.sin(phase * k * (1 + 0.0004 * k * k)) * np.exp(-t * decay)
    att = hp(rng.standard_normal(n), 1800) * np.exp(-t * 160) * 0.18 * bright
    body = np.clip(t / 0.002, 0, 1)
    return (x * 0.32 + att) * body * gain


def pipa(freq, seconds=0.12, gain=1.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    x = sum(abs(np.sin(np.pi * k * 0.2)) / k * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (14 + 6 * k)) for k in range(1, 10))
    att = hp(rng.standard_normal(n), 2500) * np.exp(-t * 300) * 0.25
    return (x * 0.35 + att) * gain


def gliss(start, notes, span, gain=0.5, accel=1.0, pan_from=-0.5, pan_to=0.5, bright=1.2):
    """刮奏：音符在 span 秒内铺开，accel>1 越刮越快。"""
    m = len(notes)
    for i, note in enumerate(notes):
        pos = (i / max(1, m - 1)) ** accel
        p = zheng(midi(note), 1.4, gain * (0.7 + 0.3 * i / m), bright)
        pan = pan_from + (pan_to - pan_from) * i / max(1, m - 1)
        add('inst', start + pos * span, mono=p, pan=pan)
        add('verb', start + pos * span, mono=p * 0.5)


# ---------- 吹管：笛 / 箫 ----------
def flute(freq, seconds, gain=1.0, kind='di', grace=None):
    """笛：亮、带笛膜嗡声；箫：暗、气声多。grace=半音数，先从高几个半音的装饰音滑进主音。"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    vib_depth = np.clip((t - 0.18) / 0.25, 0, 1) * (0.006 if kind == 'di' else 0.004)
    f = freq * (1 + vib_depth * np.sin(2 * np.pi * 5.4 * t))
    if grace:
        f = f * 2 ** (grace * np.clip(1 - t / 0.07, 0, 1) / 12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    amps = [1, .5, .3, .18, .1, .06] if kind == 'di' else [1, .28, .1, .04]
    x = sum(a * np.sin(ph * (k + 1)) for k, a in enumerate(amps))
    if kind == 'di':  # 笛膜：高次泛音随噪声抖动
        buzz = sum(np.sin(ph * k) / k for k in range(5, 11)) * (0.5 + 0.5 * lp(rng.standard_normal(n), 60))
        x = x + buzz * 0.12
    breath = bp(rng.standard_normal(n), freq * 1.5, freq * 4) * (0.06 if kind == 'di' else 0.16)
    e = env_adsr(n, 0.05 if kind == 'di' else 0.12, 0.15, 0.85, min(0.25, seconds * 0.4))
    e = e * (1 + 0.06 * np.sin(2 * np.pi * 0.7 * t))
    return (x * 0.22 + breath) * e * gain


# ---------- 打击 ----------
def taiko(gain=1.0, pitch=1.0, length=1.3):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 52 * pitch + 95 * pitch * np.exp(-t * 22)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (3.6 / max(0.6, length / 1.3)))
    over = np.sin(2 * np.pi * np.cumsum(f * 1.58) / SR) * np.exp(-t * 9) * 0.25
    skin = lp(rng.standard_normal(n), 1400) * np.exp(-t * 38) * 0.5
    return np.tanh((body + over + skin) * 1.5) * 0.9 * gain


def tanggu(gain=1.0):
    """堂鼓：小、高、短。"""
    return taiko(gain * 0.6, pitch=2.3, length=0.35)


def gong(gain=1.0, base=96, seconds=5.5):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    glide = 1 - 0.05 * (1 - np.exp(-t * 2.2))  # 大锣击后音高微降
    x = np.zeros(n)
    for r, a, d, swell in [(1, 1, .55, 0), (1.47, .7, .7, .3), (2.09, .55, .9, .5), (2.76, .45, 1.1, .7), (3.41, .3, 1.4, .9), (4.23, .22, 1.8, 1.1), (5.6, .14, 2.4, 1.3)]:
        env = np.exp(-t * d) * (1 - np.exp(-t / (0.02 + swell * 0.35))) if swell else np.exp(-t * d)
        x += a * np.sin(2 * np.pi * np.cumsum(base * r * glide) / SR) * env
    shimmer = hp(rng.standard_normal(n), 3000) * np.exp(-t * 1.2) * 0.12
    hitn = lp(rng.standard_normal(n), 900) * np.exp(-t * 25) * 0.6
    return np.tanh((x * 0.35 + shimmer + hitn) * 1.2) * gain


def woodblock(gain=1.0, f=1150):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f * t) * np.exp(-t * 55) + 0.4 * np.sin(2 * np.pi * f * 2.7 * t) * np.exp(-t * 90)
    click = bp(rng.standard_normal(n), 2000, 6000) * np.exp(-t * 400) * 0.3
    return (tone + click) * 0.45 * gain


def bell(freq, seconds=2.4, gain=1.0):
    """编钟式 FM 铃音。"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * freq * 2.76 * t) * 2.4 * np.exp(-t * 4)
    x = np.sin(2 * np.pi * freq * t + mod) + 0.3 * np.sin(2 * np.pi * freq * 2.0 * t) * np.exp(-t * 2)
    return x * np.exp(-t * 1.6) * np.clip(t / 0.002, 0, 1) * 0.32 * gain


def drop_sound(gain=1.0):
    """水滴：短促上滑的正弦 + 一点高频回声。"""
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 520 + 1500 * (1 - np.exp(-t * 60))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)
    ring = np.sin(2 * np.pi * 2350 * t) * np.exp(-t * 14) * 0.15
    return (x + ring) * np.clip(t / 0.001, 0, 1) * 0.5 * gain


def swish(seconds, gain=1.0, lo=900, hi=5200):
    """毛笔扫纸：带通噪声，中段最响。"""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    p = t / seconds
    e = np.sin(np.pi * np.clip(p, 0, 1)) ** 1.5 * (1 - 0.4 * p)
    x = bp(rng.standard_normal(n), lo, hi) * e
    return x * 0.22 * gain


def whoosh(seconds, gain=1.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    p = t / seconds
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    block = 1024
    for s in range(0, n, block):
        c = 300 * (9000 / 300) ** (p[s] ** 1.4)
        out[s:s + block] = bp(noise[s:s + block], c * 0.6, c * 1.5)
    return out * p ** 2.2 * 0.6 * gain


def impact(gain=1.0):
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    f = 30 + 60 * np.exp(-t * 7)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.8)
    return np.tanh(boom * 1.8) * 0.85 * gain


def riser(seconds, gain=1.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    p = t / seconds
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    block = 2048
    for s in range(0, n, block):
        c = 400 * (12000 / 400) ** (p[s] ** 1.6)
        out[s:s + block] = bp(noise[s:s + block], c * 0.7, c * 1.3)
    return out * 0.5 * p ** 2 * gain


def reverse_swell(seconds, freqs, gain=1.0):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    x = sum(saw(f * (1 + d), n) for f in freqs for d in (-0.006, 0.006))
    return lp(x, 2200) * (t / seconds) ** 3 * 0.1 * gain


def strings(freqs, seconds, cutoff=1500, gain=1.0, attack=0.6):
    n = int(seconds * SR)
    l = np.zeros(n)
    r = np.zeros(n)
    for f in freqs:
        for v in range(5):
            d = (v - 2) / 2 * 0.007
            w = saw(f * (1 + d), n, phase=rng.random())
            if v % 2:
                l += w
            else:
                r += w
    e = env_adsr(n, attack, 0.3, 0.9, 0.8)
    return lp(l, cutoff) * e * 0.12 * gain, lp(r, cutoff) * e * 0.12 * gain


# 音名（D 羽五声）
D2, A2, D3, F3, G3, A3, C4, D4, F4, G4, A4, C5, D5, F5, G5, A5, C6, D6 = 38, 45, 50, 53, 55, 57, 60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86
SCALE = [D3, F3, G3, A3, C4, D4, F4, G4, A4, C5, D5, F5, G5, A5, C6, D6]
PAD = {'Dm': [D3, A3, D4, F4], 'Bb': [46, 53, 58, 62], 'C': [48, 55, 60, 64], 'Am': [45, 52, 57, 60]}


def pad(bar, name, bars=1, cutoff=1300, gain=1.0, attack=0.6):
    l, r = strings([midi(m) for m in PAD[name]], bars * BAR + 0.8, cutoff, gain, attack)
    add('pad', t_of(bar), left=l, right=r)
    add('verb', t_of(bar), left=l * 0.4, right=r * 0.4)


def hit(t, gain=1.0, pitch=1.0, name=None):
    add('drums', t, mono=taiko(gain, pitch))
    add('verb', t, mono=taiko(gain * 0.35, pitch))
    if name:
        events.append((round(t, 4), name))


# ===================== 编排 =====================
# 第 0 小节：墨滴
l0, r0 = strings([midi(D2), midi(A2), midi(D3)], 2 * BAR + 1, 500, 1.4, 1.8)
add('pad', 0, left=l0, right=r0)
t_drop = t_of(0, 1)
add('fx', t_drop, mono=drop_sound(1.0))
add('verb', t_drop, mono=drop_sound(0.8))
add('fx', t_drop + 0.19, mono=drop_sound(0.25), pan=0.4)
hit(t_drop, 0.45, 0.8, 'ink-drop')
gliss(t_drop + 0.12, [D6, C6, A5, G5, F5, D5, C5, A4, G4, F4, D4], 0.9, 0.32, accel=0.85, pan_from=0.5, pan_to=-0.3, bright=1.0)
add('inst', 1.0, mono=flute(midi(A4), 1.4, 0.8, 'xiao', grace=3), pan=-0.15)
add('verb', 1.0, mono=flute(midi(A4), 1.4, 0.5, 'xiao', grace=3))
add('inst', 2.4, mono=flute(midi(G4), 0.3, 0.7, 'xiao'), pan=-0.15)
add('inst', 2.7, mono=flute(midi(D4), 2.3, 0.85, 'xiao', grace=2), pan=-0.15)
add('verb', 2.7, mono=flute(midi(D4), 2.3, 0.5, 'xiao'))

# 第 1 小节：落笔“文”（三笔）与“影”（九笔）——时间与画面 WEN_T / YING_T 一致
WEN_T = [(2.50, 0.36), (2.92, 0.36), (3.34, 0.41)]
YING_T = [(3.75 + i * 0.135, 0.12) for i in range(9)]
for i, (s, d) in enumerate(WEN_T):
    add('fx', s, mono=swish(d + 0.05, 1.0), pan=-0.2 + 0.2 * i)
    p = zheng(midi([A3, D4, F4][i]), 1.8, 0.55, 1.0, bend=(2, 0.25, 0.25) if i == 2 else None)
    add('inst', s, mono=p, pan=-0.2)
    add('verb', s, mono=p * 0.5)
for i, (s, d) in enumerate(YING_T):
    add('fx', s, mono=swish(d + 0.04, 0.7, 1500, 7000), pan=0.1)
    p = zheng(midi([D4, F4, G4, A4, C5, D5, F5, G5, A5][i]), 1.2, 0.42, 1.1)
    add('inst', s, mono=p, pan=0.25)
    add('verb', s, mono=p * 0.5)
hit(t_of(1, 2), 0.5, 1.0, 'wen-done')

# 第 2 小节：钤印，退到左侧
hit(t_of(2, 0), 1.0, 0.9, 'seal')
add('fx', t_of(2, 0), mono=bell(midi(D5), 2.6, 0.9) + bell(midi(A5), 2.6, 0.35))
add('verb', t_of(2, 0), mono=bell(midi(D5), 2.6, 0.7))
pad(2, 'Dm', 1, 900, 0.8, 0.3)
add('fx', t_of(2, 0), mono=gong(0.25, 120, 3.5))
gliss(t_of(2, 2), [D4, F4, G4, A4, C5, D5, F5, G5, A5, C6, D6], 2 * BEAT - 0.05, 0.4, accel=1.6, pan_from=-0.5, pan_to=0.5)
add('fx', t_of(2, 2), mono=whoosh(2 * BEAT, 0.5))


def groove(bar, level):
    """大鼓/堂鼓律动。level 0=写字轻，1=画面中，2=Drop 满。"""
    if level == 0:
        hit(t_of(bar, 0), 0.7)
        for b in (2, 3, 3.5, 3.75):
            add('drums', t_of(bar, b), mono=tanggu(0.5 + 0.15 * b / 4), pan=0.2)
        return
    big = [0, 1.5, 3] if level == 1 else [0, 1.5, 2, 3]
    for b in big:
        hit(t_of(bar, b), 0.85 if b == 0 else 0.6)
    smalls = [0.5, 1, 2.5, 3.5] if level == 1 else [0.5, 0.75, 1, 1.25, 2.5, 2.75, 3.25, 3.5, 3.75]
    for b in smalls:
        add('drums', t_of(bar, b), mono=tanggu(0.55 if level == 1 else 0.7), pan=(-0.25 if int(b * 4) % 2 else 0.25))


def char_run(start_bar, lines, notes_lines):
    """诗句每字一个古筝音（十六分）：第一行从第 0 拍，第二行从第 2 拍。返回每字时间。"""
    times = []
    for li, (line, notes) in enumerate(zip(lines, notes_lines)):
        for i, _ in enumerate(line):
            s = t_of(start_bar, li * 2 + i * 0.25)
            p = zheng(midi(notes[i]), 1.3, 0.48, 1.1)
            add('inst', s, mono=p, pan=0.3 - 0.6 * li)
            add('verb', s, mono=p * 0.5)
            times.append(round(s, 4))
    return times


def transform(bar):
    """字化成画：大鼓 + 冲击 + 呼啸（峰值落在拍上）+ 上行刮奏。"""
    t = t_of(bar)
    add('fx', t - 0.62, mono=whoosh(0.62, 0.8))
    hit(t, 1.0, 0.85, f'transform-{bar}')
    add('fx', t, mono=impact(0.55))
    gliss(t, [D4, F4, G4, A4, C5, D5, F5, G5, A5, C6], 0.32, 0.38, accel=1.0)


def ostinato(bar, gain=0.3, base=(D3, A3, D4, F4, A4, F4, D4, A3)):
    for k, m in enumerate(base):
        p = zheng(midi(m), 0.9, gain, 0.9)
        add('inst', t_of(bar, k * 0.5), mono=p, pan=-0.3 + 0.6 * (k % 2))


def melody(bar, phrase, gain=0.9, kind='di', octave=0):
    for pos, m, dur in phrase:
        x = flute(midi(m + octave), dur * BEAT + 0.12, gain, kind, grace=2 if dur >= 1 else None)
        add('inst', t_of(bar, pos), mono=x, pan=0.1)
        add('verb', t_of(bar, pos), mono=x * 0.6)


# ---------- 第 3 小节起：按 timeline.json 编排（朗读从拍点起，字化成画在半小节强拍） ----------
B = lambda t: t / BAR  # 秒 → 小节（可为小数，t_of(B(t), beat) 即 t + beat 拍）
STYLE = {
    'river': {'pad': ['Dm', 'Bb'], 'kind': 'di', 'char': [A4, C5, D5, C5, A4, G4, A4, D5, F5, G5, F5, D5, C5, D5],
              'theme': [(0, D5, 1), (1, F5, .5), (1.5, G5, .5), (2, A5, 1.5), (3.5, G5, .25), (3.75, F5, .25)]},
    'snow': {'pad': ['Am', 'Dm'], 'kind': 'xiao', 'char': [A5, G5, D5, C5, A4, D5, C5, A4, G4, D4],
             'theme': [(0, A4, 1.5), (1.5, G4, .5), (2, D4, 2)]},
    'willow': {'pad': ['C', 'Dm'], 'kind': 'di', 'char': [C5, D5, F5, G5, A5, G5, F5, D5, F5, G5, A5, C6, A5, G5],
               'theme': [(0, A5, .5), (.5, C6, .5), (1, D6, 1), (2, C6, .5), (2.5, A5, .5), (3, G5, .75), (3.75, A5, .25)]},
    'moon': {'pad': ['Dm', 'C'], 'kind': 'xiao', 'char': [D5, C5, A4, G4, A4, F5, G5, A5, G5, F5],
             'theme': [(0, A4, 1), (1, G4, .5), (1.5, F4, .5), (2, D4, 1.5), (3.5, F4, .5)]},
}
char_times = {}
for k, sec in enumerate(TL['sections']):
    st = STYLE[sec['scene']]
    S, A, X = sec['start'], sec['a'], sec['x']
    # 章节点：一声编钟 + 低鼓；铺底从这里换和弦
    add('fx', S, mono=bell(midi(D5 if k % 2 == 0 else A4), 2.2, 0.45), pan=0.2)
    hit(S, 0.42, 0.8, f'section-{sec["id"]}')
    l, r = strings([midi(m) for m in PAD[st['pad'][0]]], X - S + 0.6, 1000, 0.75, 0.8)
    add('pad', S, left=l, right=r)
    add('verb', S, left=l * 0.35, right=r * 0.35)
    # 朗读期：每拍一个轻古筝音保持脉动，每小节一下心跳鼓
    base = (D3, A3, D4, A3) if sec['scene'] != 'willow' else (F3, C4, F4, C4)
    n_beats = int(round((X - S) / BEAT))
    for b in range(n_beats):
        tb_ = S + b * BEAT
        add('inst', tb_, mono=zheng(midi(base[b % 4]), 0.9, 0.16, 0.8), pan=-0.25)
        if b % 4 == 0 and b > 0:
            add('drums', tb_, mono=taiko(0.32, 0.9, 0.9))
    if sec['scene'] == 'snow':  # 江雪：高处稀疏编钟像落雪
        for b in range(1, n_beats, 3):
            add('fx', S + b * BEAT + 0.31, mono=bell(midi([A5, D6, G5][b % 3]), 1.6, 0.16), pan=0.45 * (-1) ** b)
    # 逐字：字落纸那一刻一个高音古筝（与朗读同时）
    flat = [t for line in sec['chars'] for t in line]
    char_times[sec['id']] = flat
    for i_, tc in enumerate(flat):
        m = st['char'][i_ % len(st['char'])] + 12
        p = zheng(midi(m), 1.0, 0.14, 1.2)
        add('inst', tc, mono=p, pan=0.35 * (-1) ** i_)
        add('verb', tc, mono=p * 0.6)
    # 字化成画
    add('fx', X - 0.62, mono=whoosh(0.62, 0.8))
    hit(X, 1.0, 0.85, f'transform-{sec["id"]}')
    add('fx', X, mono=impact(0.55))
    gliss(X, [D4, F4, G4, A4, C5, D5, F5, G5, A5, C6], 0.32, 0.38, accel=1.0)
    # 画面停留一小节：律动 + 主题；最后一首停到修改段开始
    hold_end = TL['edit']['start'] if k == len(TL['sections']) - 1 else X + BAR
    l, r = strings([midi(m) for m in PAD[st['pad'][1]]], hold_end - X + 0.8, 1500, 0.9, 0.2)
    add('pad', X, left=l, right=r)
    add('verb', X, left=l * 0.35, right=r * 0.35)
    groove(B(X), 1)
    ostinato(B(X), 0.26, (D3, A3, D4, F4, A4, F4, D4, A3) if sec['scene'] != 'willow' else (F3, C4, F4, A4, C5, A4, F4, C4))
    melody(B(X), st['theme'], 0.85, st['kind'], octave=12 if st['kind'] == 'xiao' else 0)
    if sec['scene'] == 'willow':  # 黄鹂：笛子短促装饰音像鸟鸣
        for q in (0.5, 1.25, 2.75):
            add('inst', X + q * BEAT, mono=flute(midi(D6 + 2), 0.09, 0.5, 'di', grace=-3), pan=-0.5)
            add('inst', X + q * BEAT + 0.1, mono=flute(midi(D6), 0.08, 0.4, 'di'), pan=-0.5)
    if k == len(TL['sections']) - 1 and hold_end - X > BAR + 0.1:
        groove(B(X + BAR), 0)
    add('fx', hold_end - 0.05, mono=reverse_swell(0.4, [midi(D4), midi(A4)], 0.6))

# ---------- 修改：点选、打字、应用（落日）、铺垫 ----------
E = TL['edit']
pad(B(E['start']), 'Am', (E['apply'] - E['start']) / BAR, 900, 0.7)
melody(B(E['start']), [(0, A5, 2), (2.5, G5, 1), (4, D5, 2)], 0.45, 'xiao', 0)
hit(E['start'], 0.5, 1.0)
add('fx', E['click'], mono=woodblock(1.0, 1150), pan=0.3)
add('fx', E['card'], mono=bell(midi(A5), 1.2, 0.35), pan=0.3)
for tt_ in (E['type0'], E['type1']):
    add('fx', tt_, mono=woodblock(0.75, 1500), pan=0.3)
for b in range(int(round((E['apply'] - E['start']) / BEAT))):
    add('inst', E['start'] + b * BEAT, mono=zheng(midi([A3, D4, A3, C4][b % 4]), 1.0, 0.2, 0.8), pan=-0.3)
add('fx', E['apply'] - 0.9, mono=whoosh(0.9, 0.5))
AP, BM = E['apply'], E['boom']
hit(AP, 1.0, 0.85, 'apply')
add('fx', AP, mono=impact(0.5))
gliss(AP, [D6, C6, A5, G5, F5, D5, C5, A4, G4, F4, D4], 0.55, 0.36, accel=0.9, pan_from=0.5, pan_to=-0.5)
pad(B(AP), 'Bb', (BM - AP) / BAR, 2200, 1.0, 1.5)
span = BM - AP
for k in range(64):  # 鼓：八分 → 十六分 → 三十二分，越来越密
    tk = AP + span * (1 - (1 - k / 64) ** 1.6)
    if tk >= BM - 0.32:
        break
    add('drums', tk, mono=tanggu(0.3 + 0.55 * (tk - AP) / span), pan=0.2 * (-1) ** k)
for q, m in enumerate([D4, F4, G4, A4]):  # 琵琶轮指，每拍升一个音
    q0 = AP + q * BEAT * (span / BAR)
    k = 0
    while k * 0.065 < BEAT * (span / BAR) * (1 if q < 3 else 0.6):
        add('inst', q0 + k * 0.065, mono=pipa(midi(m + 12), 0.14, 0.16 + 0.3 * q / 3), pan=-0.2)
        k += 1
add('fx', AP + 0.3, mono=riser(span - 0.6, 0.9))
add('fx', BM - 0.32, mono=reverse_swell(0.32, [midi(D4), midi(A4), midi(D5)], 1.6))

# ---------- 收：Drop、钤印、标语、余响 ----------
F_ = TL['finale']
add('fx', BM, mono=impact(1.0))
add('fx', BM, mono=gong(0.9, 92, 6.0))
add('verb', BM, mono=gong(0.4, 92, 6.0))
events.append((round(BM, 4), 'drop'))
groove(B(BM), 2)
pad(B(BM), 'Dm', 1, 2600, 1.2, 0.05)
for k in range(16):
    m = [D4, A4, D5, F5, A5, F5, D5, A4][k % 8]
    add('inst', BM + k * BEAT / 4, mono=zheng(midi(m), 0.7, 0.3, 1.2), pan=-0.35 + 0.7 * (k % 2))
melody(B(BM), [(0, D6, .75), (0.75, C6, .25), (1, A5, 1), (2, G5, .5), (2.5, A5, .5), (3, C6, 1)], 1.0)
melody(B(BM), [(0, D5, .75), (0.75, C5, .25), (1, A4, 1), (2, G4, .5), (2.5, A4, .5), (3, C5, 1)], 0.45)
for b in (0, 2):
    add('inst', BM + b * BEAT, mono=lp(saw(midi(D2), int(BEAT * 1.8 * SR)), 300) * env_adsr(int(BEAT * 1.8 * SR), .005, .2, .6, .2) * 0.5)
add('fx', F_['seal'], mono=bell(midi(D5), 2.4, 0.8) + bell(midi(A5), 2.4, 0.3))
T2 = BM + BAR
hit(T2, 1.0, 0.8, 'end')
add('fx', T2, mono=gong(1.0, 84, 6.5))
add('verb', T2, mono=gong(0.5, 84, 6.5))
add('fx', T2, mono=impact(0.7))
l, r = strings([midi(m) for m in [D3, A3, D4, F4, A4]], LENGTH - T2, 2000, 1.3, 0.05)
fade_ = np.exp(-np.arange(len(l)) / SR * 0.55)
add('pad', T2, left=l * fade_, right=r * fade_)
add('verb', T2, left=l * fade_ * 0.5, right=r * fade_ * 0.5)
melody(B(T2), [(0, D6, 2), (2, A5, .5), (2.5, G5, .5)], 0.9)
x_ = flute(midi(D5), LENGTH - (T2 + 3 * BEAT) - 0.3, 0.8, 'di', grace=3)
add('inst', T2 + 3 * BEAT, mono=x_, pan=0.1)
add('verb', T2 + 3 * BEAT, mono=x_ * 0.7)
gliss(T2 + 2 * BEAT, [D6, C6, A5, G5, F5, D5, C5, A4, G4, F4, D4, C4, A3, G3, F3, D3], 1.0, 0.3, accel=0.9, pan_from=0.5, pan_to=-0.5, bright=0.9)
add('inst', T2, mono=lp(saw(midi(D2), int(3 * SR)), 260) * np.exp(-np.arange(int(3 * SR)) / SR * 1.2) * 0.5)

# ===================== 混音 =====================
ir_n = int(3.2 * SR)
ir_t = np.arange(ir_n) / SR
ir = [lp(rng.standard_normal(ir_n) * np.exp(-ir_t * 1.9), 5500) for _ in range(2)]
ir = [x / np.sqrt(np.sum(x ** 2)) for x in ir]
verb_in = [hp(x, 250) for x in bus['verb']]
verb = [signal.fftconvolve(verb_in[c], ir[c])[:N] for c in (0, 1)]

gains = {'drums': 0.85, 'inst': 1.0, 'pad': 0.75, 'fx': 0.75}
# 器乐版：不混人声、不做说话让位（旁白由工作台单独混入并闪避配乐）
chans = [sum(bus[k][c] * g for k, g in gains.items()) + verb[c] * 0.45 for c in (0, 1)]
stereo = np.stack(chans, axis=1)
stereo = signal.sosfilt(signal.butter(2, 28, 'high', fs=SR, output='sos'), stereo, axis=0)
# 软限幅推响度到约 -14 LUFS（宣传片常用），真峰值留 1 dB 余量
stereo *= 0.92 / np.max(np.abs(stereo))
stereo = np.tanh(stereo * 2.1) / np.tanh(2.1) * 0.86
fi = int(0.005 * SR)
stereo[:fi] *= np.linspace(0, 1, fi)[:, None]
tail = int(1.2 * SR)
stereo[-tail:] *= np.linspace(1, 0, tail)[:, None] ** 2

out = sys.argv[1] if len(sys.argv) > 1 else 'shanshui.wav'
wavfile.write(out, SR, (stereo * 32767 * 0.95).astype(np.int16))
import json, os
cues = {'bpm': BPM, 'beat': BEAT, 'bar': BAR, 'length': LENGTH, 'events': sorted(events), 'chars': char_times,
        'wen': WEN_T, 'ying': YING_T}
with open(os.path.join(os.path.dirname(os.path.abspath(out)), 'cues.json'), 'w') as f:
    json.dump(cues, f, ensure_ascii=False, indent=1)
beats = [round(i * BEAT, 4) for i in range(int(LENGTH / BEAT) + 1)]
with open(os.path.join(os.path.dirname(os.path.abspath(out)), 'beats.json'), 'w') as f:
    json.dump({'bpm': BPM, 'beats': beats, 'method': 'authored-grid (synth.py 按 96 BPM 逐拍排布)'}, f)
print(f'{out}: {LENGTH:.3f}s @ {BPM} BPM')
