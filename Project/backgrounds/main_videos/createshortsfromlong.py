import os
import subprocess
import re

# 1. The path to the folder where you will put the long videos (create it)
input_folder = r"C:\AutoVideoFactory\backgrounds\long_videos"

# 2. The path to the main videos folder (from which n8n pulls)
output_folder = r"C:\AutoVideoFactory\backgrounds\main_videos"

part_duration = 119 # Duration of one part in seconds (59 seconds is ideal for shorts)
overlap = 3 # Overlap by 3 seconds

# Function to read the full video duration
def get_duration(file_path):
    cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{file_path}"'
    return float(subprocess.check_output(cmd, shell=True).decode('utf-8').strip())

# Filter to remove invalid symbols from filenames (keeps English, Arabic, and numbers)
clean_name_pattern = re.compile(r'[^\w\s-]')

for filename in os.listdir(input_folder):
    if not filename.endswith(('.mp4', '.mov')):
        continue

    filepath = os.path.join(input_folder, filename)
    
    try:
        total_duration = get_duration(filepath)
    except Exception as e:
        print(f"❌ Error reading {filename}: {e}")
        continue

    name_no_ext = os.path.splitext(filename)[0]
    
    # Clean the name for global use
    clean_name = clean_name_pattern.sub('', name_no_ext)
    clean_name = re.sub(r'\s+', ' ', clean_name).strip()

    if not clean_name:
        clean_name = "Exclusive_Clip"

    start_time = 0
    part_num = 1

    print(f"⏳ Video cutting: {clean_name} (duration: {total_duration:.2f} seconds)")

    while start_time < total_duration:
        end_time = min(start_time + part_duration, total_duration)
        target_duration = end_time - start_time

        # If less than 5 seconds remain, do not create a new video to avoid very short videos.
        if target_duration < 5 and part_num > 1:
            break

        # Name the new segment (example: GTA V Gameplay Part 1)
        out_filename = f"{clean_name} Part {part_num}.mp4"
        out_filepath = os.path.join(output_folder, out_filename)

        print(f"   ✂️ Production: {out_filename} (from {start_time} to {end_time})")

        # The magic FFmpeg command: Slicing + converting to H.264
        cmd = f'ffmpeg -v error -i "{filepath}" -ss {start_time} -t {target_duration} -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k -y "{out_filepath}"'
        
        try:
            subprocess.run(cmd, shell=True, check=True)
        except Exception as e:
            print(f"❌ Error cutting {out_filename}: {e}")

        start_time += (part_duration - overlap)
        part_num += 1

print("✅ All videos have been processed successfully!")