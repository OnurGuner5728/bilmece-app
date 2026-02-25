"""
Bilmecelerce - Ses dosyası üretici
Kullanılan: edge-tts (MIT lisanslı, Microsoft EmelNeural - tr-TR)

Kurulum: pip install edge-tts
Çalıştır: python scripts/generate_audio.py
"""

import asyncio
import json
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

try:
    import edge_tts
except ImportError:
    print("edge-tts bulunamadı. Kurmak için: pip install edge-tts")
    sys.exit(1)

VOICE = "tr-TR-EmelNeural"
RATE = "-10%"          # Çocuklar için biraz daha yavaş
PITCH = "+5Hz"         # Hafif yüksek ses tonu (sıcak, çocuk dostu)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "audio")
RIDDLES_FILE = os.path.join(os.path.dirname(__file__), "..", "src", "data", "riddles.json")

# Standart cümleler
STANDARD_PHRASES = {
    "tebrikler": "Tebrikler! Doğru cevap!",
    "yanlis": "Yanlış! Tekrar dene.",
    "ipucu": "İpucu gösteriliyor.",
    "harika": "Harika! Bir sonraki bilmeceye geçiyoruz.",
    "bitti": "Tüm bilmeceleri tamamladın! Tebrikler!",
}

CONCURRENCY = 10  # Aynı anda kaç istek


async def generate_one(semaphore: asyncio.Semaphore, audio_id: str, text: str, output_path: str) -> bool:
    """Tek bir ses dosyası üret. Zaten varsa atla."""
    if os.path.exists(output_path):
        return False  # Zaten var, atla

    async with semaphore:
        try:
            communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
            await communicate.save(output_path)
            return True
        except Exception as e:
            print(f"  HATA [{audio_id}]: {e}")
            return False


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Bilmeceleri yükle
    with open(RIDDLES_FILE, encoding="utf-8") as f:
        data = json.load(f)
    riddles = data["riddles"]

    tasks = []
    semaphore = asyncio.Semaphore(CONCURRENCY)

    # Bilmece soruları
    for riddle in riddles:
        rid = riddle["id"]
        question = riddle["question"]
        out_path = os.path.join(OUTPUT_DIR, f"{rid}.mp3")
        tasks.append((rid, question, out_path))

    # Bilmece cevapları
    for riddle in riddles:
        rid = riddle["id"]
        answer = riddle["answer"]
        out_path = os.path.join(OUTPUT_DIR, f"{rid}_cevap.mp3")
        tasks.append((f"{rid}_cevap", answer, out_path))

    # Standart cümleler
    for phrase_id, text in STANDARD_PHRASES.items():
        out_path = os.path.join(OUTPUT_DIR, f"{phrase_id}.mp3")
        tasks.append((phrase_id, text, out_path))

    total = len(tasks)
    print(f"Toplam {total} ses dosyası üretilecek (ses: {VOICE}, hız: {RATE})")
    print(f"Çıktı dizini: {OUTPUT_DIR}")
    print(f"Zaten mevcut olanlar atlanacak.\n")

    # Paralel üretim
    coros = [generate_one(semaphore, aid, text, path) for aid, text, path in tasks]
    results = await asyncio.gather(*coros)

    created = sum(1 for r in results if r)
    skipped = total - created
    print(f"\nTamamlandı: {created} yeni, {skipped} zaten mevcuttu.")
    print(f"Dosyalar: {OUTPUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
