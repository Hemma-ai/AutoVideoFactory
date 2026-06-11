  import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import { random, Audio, staticFile } from 'remotion';
import { DynamicScene } from './DynamicScene';
import { OutroScene } from './OutroScene';

type SceneType = {
  voiceover_ar: string;
  durationInFrames?: number;
  [key: string]: any; 
};

type MyMysteryVideoProps = {
  scenes: SceneType[];
  bgm_url?: string;
  video_type?: string; 
};

// 🎵 مكتبة الموسيقى مربوطة بأسماء الملفات في الصورة تماماً
const BGM_MAP: Record<string, string[]> = {
  'advice': ["advice_bgm1.mp3", "advice_bgm2.mp3"],
  'promo': ["promo_bgm1.mp3", "promo_bgm2.mp3"],
  'story_wisdom': ["region_bgm1.mp3", "region_bgm2.mp3"],
  'story_craft': ["realaty_bgm3.mp3", "realaty_bgm4.mp3"]
};

export const MyMysteryVideo: React.FC<MyMysteryVideoProps> = ({ scenes, bgm_url, video_type = 'story_craft' }) => {
  
  const seedString = scenes.length > 0 ? scenes[0].voiceover_ar : 'default';
  
  // اختيار الموسيقى بناءً على نوع الفيديو
  const currentBgmTracks = BGM_MAP[video_type] || BGM_MAP['story_craft'];
  const selectedTrackIndex = Math.floor(random(`bgm-${seedString}`) * currentBgmTracks.length);
  const finalBgmUrl = bgm_url || currentBgmTracks[selectedTrackIndex];

  // ألوان فاتحة راقية تناسب جميع الفيديوهات
  const themeColors = ['#FFD700', '#00FFFF', '#FF4500', '#E8F8F5', '#F5E6CC']; 
  const videoThemeColor = themeColors[Math.floor(random(`color-theme-${seedString}`) * themeColors.length)];

  return (
    <>
      {/* 🚀 استيراد خط كايرو ليعمل على كامل المشروع 🚀 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap');
      `}</style>

      {/* 🟢 منع الموسيقى الخلفية تماماً إذا كان الفيديو من نوع dual_video 🟢 */}
      {finalBgmUrl && video_type !== 'dual_video' && (
        <Audio src={finalBgmUrl.startsWith('http') ? finalBgmUrl : staticFile(finalBgmUrl)} volume={0.08} loop />
      )}

      <TransitionSeries>
        {scenes.map((scene, index) => {
          
         // 🟢 نظام الانتقالات (Transitions) المخصص والمتنوع 🟢
          let transitionEffect: any = null;
          let TRANSITION_FRAMES = 15;
          const isLastScene = index === scenes.length - 1;

          // استخدمنا رقم المشهد (index) لتوليد عشوائية متغيرة لكل مشهد في نفس الفيديو
          const rand = random(`trans-${seedString}-${index}`);

          if (video_type === 'promo' || video_type === 'story_craft') {
            // 🚀 الإعلاني والواقعي: انتقالات سريعة وديناميكية (10 إطارات)
            TRANSITION_FRAMES = 10;
            if (rand > 0.75) transitionEffect = wipe({ direction: 'from-left' });
            else if (rand > 0.5) transitionEffect = slide({ direction: 'from-bottom' });
            else if (rand > 0.25) transitionEffect = wipe({ direction: 'from-top-left' });
            else transitionEffect = slide({ direction: 'from-right' });
          } 
          else if (video_type === 'advice' || video_type === 'story_wisdom') {
            // 🕊️ النصائح والديني: انتقالات هادئة وناعمة (25 إطار)
            TRANSITION_FRAMES = 25;
            if (rand > 0.6) transitionEffect = fade();
            else if (rand > 0.3) transitionEffect = wipe({ direction: 'from-top' }); // مسح بطيء وهادئ
            else transitionEffect = fade(); // التركيز على التلاشي للهدوء
          }

          return (
            <React.Fragment key={index}>
              <TransitionSeries.Sequence durationInFrames={scene.durationInFrames || 150}>
                <DynamicScene 
                  sceneData={scene as any} 
                  sceneIndex={index} 
                  videoThemeColor={videoThemeColor}
                  videoType={video_type}
                />
              </TransitionSeries.Sequence>

              {/* تطبيق الانتقال فقط إذا كان موجوداً ولم نكن في المشهد الأخير */}
              {!isLastScene && transitionEffect && TRANSITION_FRAMES > 0 && (
                <TransitionSeries.Transition
                  presentation={transitionEffect}
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* مشهد الخاتمة: يظهر فقط للإعلاني والنصائح */}
        {(video_type === 'promo' || video_type === 'advice') && (
          <>
            <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
            <TransitionSeries.Sequence durationInFrames={150}>
              <OutroScene videoThemeColor={videoThemeColor} videoType={video_type} />
            </TransitionSeries.Sequence>
          </>
        )}
      </TransitionSeries>
    </>
  );
};