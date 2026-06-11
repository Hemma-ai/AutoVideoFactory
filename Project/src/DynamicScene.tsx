import React from 'react';
import { AbsoluteFill, Video, OffthreadVideo, useCurrentFrame, spring, useVideoConfig, random, Audio, Img, staticFile, Sequence } from 'remotion';
import { interpolate } from 'remotion';
import logoImg = require('./your_logo.png'); 

type SceneData = {
  voiceover_ar: string;
  title?: string;
  video_urls?: string[];
  video_url?: string;
  audio_url?: string;
  durationInFrames?: number;  
  audioDurationFrames?: number; 
  main_video_url?: string;       
  satisfying_urls?: string[];
  cta_start?: number;    
  cta_end?: number;    
};

export const DynamicScene: React.FC<{ sceneData: SceneData; sceneIndex: number; videoThemeColor: string; videoType: string }> = ({ sceneData, sceneIndex, videoThemeColor, videoType }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. تجهيز الكلمات والوقت الفعلي
  const words = sceneData.voiceover_ar ? sceneData.voiceover_ar.split(' ') : [];
  const actualAudioFrames = sceneData.audioDurationFrames || (durationInFrames - 30);
  const framesPerWord = words.length > 0 ? actualAudioFrames / words.length : 15;
  const titleOpacity = interpolate(frame, [75, 100], [1, 0], { extrapolateRight: 'clamp' });  
  // حساب مؤشر الكلمة التي ينطقها المعلق الآن
  const currentWordIndex = Math.floor(frame / framesPerWord);
  const visibleWordsCount = currentWordIndex + 1;

  // دالة تنظيف المسارات السحرية: تحذف أي أخطاء في مسار الملف لمنع خطأ 404 نهائياً
  const cleanPath = (url?: string) => {
    if (!url) return "";
    return url.replace('public/', '').replace('public\\\\', '');
  };

  // 2. خوارزمية التقطيع (Chunking) للقصص
  const WORDS_PER_CHUNK = 6; 
  const maxChunkIndex = Math.max(0, Math.ceil(words.length / WORDS_PER_CHUNK) - 1);
  const currentChunkIndex = Math.min(Math.floor(currentWordIndex / WORDS_PER_CHUNK), maxChunkIndex);
  
  const chunkStartWordIndex = currentChunkIndex * WORDS_PER_CHUNK;
  const chunkEndWordIndex = Math.min(chunkStartWordIndex + WORDS_PER_CHUNK, words.length);
  const currentChunkWords = words.slice(chunkStartWordIndex, chunkEndWordIndex);

  // تجهيز رابط الفيديو الفردي مع التنظيف
  const safeVideoUrl = sceneData.video_url?.startsWith('http') 
    ? sceneData.video_url 
    : (sceneData.video_url ? staticFile(cleanPath(sceneData.video_url)) : null);

  const fontFamily = "'Cairo', sans-serif";

  const isPromo = videoType === 'promo';
  const isAdvice = videoType === 'advice';
  const isStoryReligion = videoType === 'story_wisdom';
  const isStoryCraft = videoType === 'story_craft';
  const isStory = isStoryReligion || isStoryCraft;

  const showLogo = isPromo || isAdvice;

  // تأثيرات الإعلانات
  const promoScale = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0.5, 1, 1, 1.5], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const promoOpacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // الستايل الأساسي للنصوص
  const baseTextStyle = {
    fontFamily: fontFamily,
    fontSize: '85px',
    fontWeight: '900',
    textShadow: '3px 3px 0px #000, 0px 8px 30px rgba(0,0,0,0.9)',
    lineHeight: '1.5',
    direction: 'rtl' as const,
    textAlign: 'center' as const
  };

  // 🟢 حساب الحصص الزمنية المتساوية ديناميكياً لمنع الاقتطاع العشوائي 🟢
  const totalSatisfyingVideos = sceneData.satisfying_urls?.length || 1;
  const dynamicSatDuration = Math.ceil(durationInFrames / totalSatisfyingVideos);

  const totalStoryVideos = sceneData.video_urls?.length || 1;
  const dynamicStoryDuration = Math.ceil(durationInFrames / totalStoryVideos);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      
      {/* 🟢 الشرط الأول: فيديو مزدوج (شاشة منقسمة) 🟢 */}
      {videoType === 'dual_video' && sceneData.main_video_url && sceneData.satisfying_urls ? (
        <AbsoluteFill style={{ flexDirection: 'row' }}>
          
          {/* النصف الأيسر: الفيديو الأساسي كاملاً */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <OffthreadVideo 
              src={staticFile(cleanPath(sceneData.main_video_url))} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* النصف الأيمن: الفيديوهات المريحة الموزعة بالتساوي والمسرعة */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {sceneData.satisfying_urls.map((url, i) => {
              const startFrame = i * dynamicSatDuration;

              if (startFrame >= durationInFrames) return null;
              const sequenceDuration = Math.min(dynamicSatDuration, durationInFrames - startFrame);

              return (
                <Sequence 
                  key={i} 
                  from={startFrame} 
                  durationInFrames={sequenceDuration} 
                >
                  <OffthreadVideo 
                    src={staticFile(cleanPath(url))} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    muted={true} 
                    playbackRate={1.2} // 🟢 تسريع الفيديو الخلفي المريح لزيادة الحماس
                  />
                </Sequence>
              );
            })}
          </div>

        </AbsoluteFill>
      ) : sceneData.video_urls && sceneData.video_urls.length > 0 ? (
        // 🟢 الشرط الثاني: فيديو قصصي عادي مع تقسيم زمني ديناميكي وتسريع المقاطع 🟢
        <AbsoluteFill>
          {sceneData.video_urls.map((url, i) => {
            const startFrame = i * dynamicStoryDuration;
            
            if (startFrame >= durationInFrames) return null;
            const sequenceDuration = Math.min(dynamicStoryDuration, durationInFrames - startFrame);

            return (
              <Sequence key={i} from={startFrame} durationInFrames={sequenceDuration}>
                <OffthreadVideo 
                  src={staticFile(cleanPath(url))} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  muted={true}
                  playbackRate={1.2} // 🟢 تسريع الفيديوهات الطبيعية لمنع الملل البصري
                />
              </Sequence>
            );
          })}
        </AbsoluteFill>
      ) : safeVideoUrl ? (
        // 🟢 الشرط الثالث: فيديو مؤسسي أو إعلاني 🟢
        <Video 
          src={safeVideoUrl} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1.0  }}
          muted={true}
        />
      ) : null}

      {/* 2. العنوان في المشهد الأول */}
      {sceneIndex === 0 && sceneData.title && (videoType === 'story_craft' || videoType === 'story_wisdom') && (
        <AbsoluteFill style={{ 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          paddingTop: '8%', 
          opacity: titleOpacity 
        }}>
          <div style={{
            backgroundColor: 'rgba(230, 0, 0, 0.85)', 
            padding: '10px 30px',
            borderRadius: '15px',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.5)',
            width: '90%',
            textAlign: 'center',
            direction: 'rtl',
            border: '2px solid rgba(255, 255, 255, 0.2)' 
          }}>
            <h1 style={{ ...baseTextStyle, fontSize: '45px', color: '#FFFFFF', margin: 0 }}>
              {sceneData.title}
            </h1>
          </div>
        </AbsoluteFill>
      )}

      {/* الشعار */}
      {showLogo && (
        <AbsoluteFill style={{ padding: '60px', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
           <Img src={logoImg} style={{ width: '160px', opacity: 0.9 }} />
        </AbsoluteFill>
      )}

      {/* تأثيرات النصوص */}
      {isPromo ? (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '10%' }}>
          <div style={{ ...baseTextStyle, transform: `scale(${promoScale})`, opacity: promoOpacity, color: '#FFFFFF' }}>
            <span style={{ color: videoThemeColor }}>{words.slice(0, Math.ceil(words.length/2)).join(' ')} </span>
            <span>{words.slice(Math.ceil(words.length/2)).join(' ')}</span>
          </div>
        </AbsoluteFill>
      ) : isStory ? (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', width: '85%', direction: 'rtl' }}>
            {currentChunkWords.map((word, indexInChunk) => {
              const absoluteWordIndex = chunkStartWordIndex + indexInChunk;
              const isVisible = absoluteWordIndex <= currentWordIndex;
              
              const isCtaWord = sceneData.cta_start !== undefined && sceneData.cta_end !== undefined && sceneData.cta_start !== -1 && absoluteWordIndex >= sceneData.cta_start && absoluteWordIndex <= sceneData.cta_end;

              const isHighlighted = random(`hl-${sceneIndex}-${absoluteWordIndex}`) > 0.75;
              
              const wordColor = isCtaWord ? '#FFD700' : (isHighlighted ? videoThemeColor : '#FFFFFF');
              const shadow = isCtaWord ? '0px 0px 20px rgba(255, 215, 0, 0.9), 3px 3px 0px #000' : baseTextStyle.textShadow;

              const wordStartFrame = absoluteWordIndex * framesPerWord;
              const wordScale = spring({ fps, frame: frame - wordStartFrame, config: { damping: 14 } });
              
              const finalScale = isCtaWord && isVisible ? `scale(${wordScale * 1.15})` : `scale(${isVisible ? wordScale : 1})`;

              return (
                <span key={absoluteWordIndex} style={{ 
                  ...baseTextStyle, 
                  color: wordColor, 
                  opacity: isVisible ? 1 : 0, 
                  transform: finalScale,
                  display: 'inline-block',
                  textShadow: shadow 
                }}>
                  {word}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '40%' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', width: '90%', direction: 'rtl' }}>
            {words.map((word, i) => {
              const isVisible = i < visibleWordsCount;
              const wordStartFrame = i * framesPerWord;
              const wordScale = spring({ fps, frame: frame - wordStartFrame, config: { damping: 14 } });

              return (
                <span key={i} style={{ 
                  ...baseTextStyle, 
                  color: '#FFFFFF', 
                  opacity: isVisible ? 1 : 0, 
                  transform: `scale(${isVisible ? wordScale : 1})`,
                  display: 'inline-block'
                }}>
                  {word}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {sceneData.audio_url && (
        <Audio src={staticFile(cleanPath(sceneData.audio_url))} />
      )}

      {sceneIndex === 0 && videoType === 'dual_video' && frame >= Math.floor(durationInFrames / 2) && frame <= Math.floor(durationInFrames / 2) + 120 && (
        <AbsoluteFill style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: interpolate(
                frame,
                [
                    Math.floor(durationInFrames / 2), 
                    Math.floor(durationInFrames / 2) + 15, 
                    Math.floor(durationInFrames / 2) + 105, 
                    Math.floor(durationInFrames / 2) + 120
                ],
                [0, 1, 1, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
            zIndex: 999
        }}>
            <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                padding: '40px 60px',
                borderRadius: '25px',
                border: '3px solid #FFD700', 
                textAlign: 'center',
                boxShadow: '0px 20px 50px rgba(0,0,0,0.9)',
                maxWidth: '85%',
                direction: 'ltr' 
            }}>
                <h1 style={{ ...baseTextStyle, direction: 'ltr', fontSize: '50px', color: '#FFD700', margin: '0 0 25px 0' }}>
                    Leave a comment and give us your opinion, and don't forget
                </h1>
                <h2 style={{ ...baseTextStyle, direction: 'ltr', fontSize: '45px', color: '#FFFFFF', margin: 0 }}>
                    👍 LIKE • 💬 Comment • 🔄 Share • 🔔 Subscribe
                </h2>
            </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};