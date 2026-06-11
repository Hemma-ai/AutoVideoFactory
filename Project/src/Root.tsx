import React from 'react';
import { Composition } from 'remotion';
import { MyMysteryVideo } from './MyMysteryVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 🟢 القالب الأصلي (الطولي - للشورتس والقصص والإعلانات القديمة) لا يمس 🟢 */}
      <Composition
        id="MyVideo"
        component={MyMysteryVideo}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: [],
          bgm_url: "",
          video_type: "mystery",
        }}
        calculateMetadata={({ props }) => {
          if (!props || !Array.isArray(props.scenes) || props.scenes.length === 0) {
            return { durationInFrames: 300 }; 
          }
          let totalFrames = 0;
          for (const scene of props.scenes) {
            totalFrames += (scene.durationInFrames || 150);
          }
          if (props.video_type === 'promo' || props.video_type === 'advice') {
             totalFrames += 150; 
          }
          return { durationInFrames: totalFrames, props };
        }}
      />

      {/* 🟢 القالب الجديد للفيديو المزدوج (شورتس مربع 1:1) 🟢 */}
      <Composition
        id="MyDualVideo"
        component={MyMysteryVideo}
        fps={30}
        width={1080}  // 🟢 عرض مربع ليقبله يوتيوب كشورتس
        height={1080} // 🟢 طول مربع ليقبله يوتيوب كشورتس
        defaultProps={{
          scenes: [],
          bgm_url: "",
          video_type: "dual_video",
        }}
        calculateMetadata={({ props }) => {
          if (!props || !Array.isArray(props.scenes) || props.scenes.length === 0) {
            return { durationInFrames: 3600 }; // دقيقتين افتراضياً
          }
          let totalFrames = props.scenes[0].durationInFrames || 3600;
          return { durationInFrames: totalFrames, props };
        }}
      />
    </>
  );
};