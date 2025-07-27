/**
 * Enhanced Shizuku Live2D Controller Hook
 * Full 50 Physics Settings Implementation
 * 
 * Maps AI JSON responses to Live2D model parameters with complete physics control
 */

import { useCallback, useRef } from 'react';
import type { Live2DModelRef } from '@/components/live2d/utils/live2d-types';
import type { ShizukuResponse } from '@/hooks/useShizukuAI';
import { PHYSICS_PARAM_SCALING } from '@/prompts/physics-mapping';

// Enhanced expression mapping for new emotion system
const EMOTION_MAP = {
  love: '爱心眼',
  starry: '星星眼', 
  angry: '生气',
  crying: '哭哭',
  dark: '黑脸',
  blush: '脸红',
  blank: '空白眼',
  dizzy: '蚊香眼',
  none: null
};

// Hand items mapping (AI-controlled)
const HAND_ITEM_MAP = {
  gaming: '游戏机',
  microphone: '麦克风',
  tea: '茶杯',
  heart: '比心',
  board: '写字板',
  none: null
};

// Enhanced decorations with intensity levels
const DECORATION_INTENSITY_MAP = {
  blush: {
    none: null,
    light: '脸红_轻',
    medium: '脸红',
    heavy: '脸红_重'
  },
  tears: {
    none: null,
    light: '眼泪_轻',
    flowing: '眼泪',
    streaming: '眼泪_重'
  },
  sweat: {
    none: null,
    light: '汗_轻',
    nervous: '汗_紧张',
    heavy: '汗_重'
  }
};

// Enhanced physics parameter mapping
interface EnhancedPhysics {
  headMovement: { x: number; y: number; z: number };
  bodyMovement: { x: number; y: number; z: number };
  breathing: number;
  eyeTracking: { x: number; y: number };
  eyeOpening: { left: number; right: number };
  eyebrowMovement: { leftY: number; rightY: number; leftForm: number; rightForm: number };
  hairDynamics: { front: number; side: number; back: number; accessories: number };
  bodyDynamics: { chest: number; skirt: number; legs: number };
  specialFeatures: { animalEars: number; wings: number };
}

export function useShizukuControllerEnhanced() {
  const mouthTimelineRef = useRef<NodeJS.Timeout | null>(null);
  const physicsTimelineRef = useRef<NodeJS.Timeout | null>(null);
  const currentEmotionRef = useRef<string | null>(null);
  const currentDecorationsRef = useRef<Set<string>>(new Set());
  const currentHandItemRef = useRef<string | null>(null);

  const clearCurrentTimelines = useCallback(() => {
    if (mouthTimelineRef.current) {
      clearTimeout(mouthTimelineRef.current);
      mouthTimelineRef.current = null;
    }
    if (physicsTimelineRef.current) {
      clearTimeout(physicsTimelineRef.current);
      physicsTimelineRef.current = null;
    }
  }, []);

  const applyResponseToModel = useCallback((modelRef: Live2DModelRef, response: ShizukuResponse) => {
    if (!modelRef.current) return;

    clearCurrentTimelines();

    // Apply enhanced physics
    if (response.physics) {
      applyEnhancedPhysics(modelRef, response.physics as EnhancedPhysics);
    }

    // Apply emotions with intensity
    if (response.emotions) {
      applyEmotionWithIntensity(modelRef, response.emotions);
    }

    // Apply enhanced decorations
    if (response.decorations) {
      applyEnhancedDecorations(modelRef, response.decorations);
    }

    // Apply hand item
    if (response.handItem) {
      applyHandItem(modelRef, response.handItem);
    }

    // Apply mouth shape and timeline
    if (response.mouth) {
      applyMouthSettings(modelRef, response.mouth);
    }

    // Apply mouth timeline for lip sync
    if (response.mouth_open_timeline && response.mouth_open_timeline.length > 0) {
      applyMouthTimeline(modelRef, response.mouth_open_timeline);
    }

    // Apply physics timeline if present
    if (response.physics_timeline && response.physics_timeline.length > 0) {
      applyPhysicsTimeline(modelRef, response.physics_timeline);
    }

  }, [clearCurrentTimelines]);

  // Enhanced physics application with all 50 settings
  const applyEnhancedPhysics = useCallback((modelRef: Live2DModelRef, physics: EnhancedPhysics) => {
    if (!modelRef.current) return;

    // Foundation parameters (Settings 1-3)
    modelRef.current.setParameterValue('ParamAngleX', physics.headMovement.x);
    modelRef.current.setParameterValue('ParamAngleY', physics.headMovement.y);
    modelRef.current.setParameterValue('ParamAngleZ', physics.headMovement.z);

    // Body movement
    modelRef.current.setParameterValue('ParamBodyX', physics.bodyMovement.x);
    modelRef.current.setParameterValue('ParamBodyY', physics.bodyMovement.y);
    modelRef.current.setParameterValue('ParamBodyZ', physics.bodyMovement.z);

    // Breathing
    modelRef.current.setParameterValue('ParamBreath', physics.breathing);

    // Eye tracking (Settings 4-7)
    modelRef.current.setParameterValue('ParamEyeBallX', physics.eyeTracking.x);
    modelRef.current.setParameterValue('ParamEyeBallY', physics.eyeTracking.y);

    // Eye opening (Settings 8-17)
    modelRef.current.setParameterValue('ParamEyeLOpen', physics.eyeOpening.left);
    modelRef.current.setParameterValue('ParamEyeROpen', physics.eyeOpening.right);

    // Eyebrow control (Settings 22-29)
    modelRef.current.setParameterValue('ParamBrowLY', physics.eyebrowMovement.leftY);
    modelRef.current.setParameterValue('ParamBrowRY', physics.eyebrowMovement.rightY);
    modelRef.current.setParameterValue('ParamBrowLForm', physics.eyebrowMovement.leftForm);
    modelRef.current.setParameterValue('ParamBrowRForm', physics.eyebrowMovement.rightForm);

    // Hair dynamics (Settings 30-35) - Enhanced mapping with head movement synchronization
    const hairFrontScale = PHYSICS_PARAM_SCALING.hairDynamics.front.scale;
    const hairSideScale = PHYSICS_PARAM_SCALING.hairDynamics.side.scale;
    const hairBackScale = PHYSICS_PARAM_SCALING.hairDynamics.back.scale;
    const accessoriesScale = PHYSICS_PARAM_SCALING.hairDynamics.accessories.scale;
    
    // Apply head movement influence to hair physics for natural animation
    const headInfluence = {
      x: Math.abs(physics.headMovement.x) * 0.1, // Convert head X to hair sway
      y: Math.abs(physics.headMovement.y) * 0.05, // Convert head Y to hair bounce
      z: Math.abs(physics.headMovement.z) * 0.08  // Convert head Z to hair tilt
    };
    
    // Front hair (頭髮1) - Most responsive to head movement
    const frontHairValue = (physics.hairDynamics.front + headInfluence.x) * hairFrontScale;
    modelRef.current.setParameterValue('Param21', Math.min(frontHairValue, hairFrontScale));
    modelRef.current.setParameterValue('Param22', Math.min(frontHairValue * 0.8, hairFrontScale)); // Secondary front
    
    // Side hair (頭髮2) - Responsive to head tilt
    const sideHairValue = (physics.hairDynamics.side + headInfluence.z) * hairSideScale;
    modelRef.current.setParameterValue('Param23', Math.min(sideHairValue, hairSideScale));
    modelRef.current.setParameterValue('Param24', Math.min(sideHairValue * 0.9, hairSideScale)); // Secondary side
    
    // Back hair (頭髮11, 頭髮22) - Delayed response with head Y movement
    const backHairValue = (physics.hairDynamics.back + headInfluence.y) * hairBackScale;
    modelRef.current.setParameterValue('Param25', Math.min(backHairValue, hairBackScale));
    modelRef.current.setParameterValue('Param26', Math.min(backHairValue * 0.7, hairBackScale)); // Delayed back hair
    
    // Hair accessories (蝴蝶结L, 蝴蝶结R) - Subtle movement
    const accessoryValue = physics.hairDynamics.accessories * accessoriesScale;
    modelRef.current.setParameterValue('Param33', accessoryValue); // Left bow
    modelRef.current.setParameterValue('Param34', accessoryValue); // Right bow

    // Body dynamics (Settings 43-48) - Enhanced with breathing and movement synchronization
    const chestScale = PHYSICS_PARAM_SCALING.bodyDynamics.chest.scale;
    const skirtScale = PHYSICS_PARAM_SCALING.bodyDynamics.skirt.scale;
    const legsScale = PHYSICS_PARAM_SCALING.bodyDynamics.legs.scale;
    
    // Body movement influence on dynamics
    const bodyInfluence = {
      sway: Math.abs(physics.bodyMovement.x) * 0.15, // Horizontal body sway affects clothing
      bounce: Math.abs(physics.bodyMovement.y) * 0.1,  // Vertical movement affects bounce
      breathing: physics.breathing * 0.3 // Breathing affects chest movement
    };
    
    // Enhanced chest physics (胸x, 胸y) - synchronized with breathing and body movement
    const chestXValue = (physics.bodyDynamics.chest + bodyInfluence.breathing + bodyInfluence.sway) * chestScale;
    const chestYValue = (physics.bodyDynamics.chest + bodyInfluence.breathing + bodyInfluence.bounce) * chestScale;
    modelRef.current.setParameterValue('Param27', Math.min(chestXValue, chestScale)); // Chest X movement
    modelRef.current.setParameterValue('Param28', Math.min(chestYValue, chestScale)); // Chest Y movement
    
    // Enhanced skirt physics (裙子xz, 裙子, 裙子xz（繁）, 裙子y（繁）) - responsive to body movement
    const skirtBaseValue = physics.bodyDynamics.skirt + bodyInfluence.sway;
    const skirtComplexValue = physics.bodyDynamics.skirt + bodyInfluence.sway + bodyInfluence.bounce;
    
    modelRef.current.setParameterValue('Param45', Math.min(skirtBaseValue * skirtScale, skirtScale)); // Skirt XZ
    modelRef.current.setParameterValue('Param46', Math.min(physics.bodyDynamics.skirt * skirtScale, skirtScale)); // Skirt general
    modelRef.current.setParameterValue('Param47', Math.min(skirtComplexValue * skirtScale * 1.2, skirtScale)); // Skirt XZ complex
    modelRef.current.setParameterValue('Param48', Math.min(skirtComplexValue * skirtScale * 0.8, skirtScale)); // Skirt Y complex
    
    // Enhanced leg physics (腿, 腿(2), 腿(3)) - coordinated movement simulation
    const legBaseValue = physics.bodyDynamics.legs + bodyInfluence.bounce;
    const legAlternateValue = physics.bodyDynamics.legs + bodyInfluence.sway;
    
    modelRef.current.setParameterValue('Param108', Math.min(legBaseValue * legsScale, legsScale)); // Primary leg
    modelRef.current.setParameterValue('Param109', Math.min(legAlternateValue * legsScale * 0.8, legsScale)); // Secondary leg (offset)
    modelRef.current.setParameterValue('Param110', Math.min((legBaseValue + legAlternateValue) * 0.5 * legsScale, legsScale)); // Combined leg movement

    // Special features (Settings 41-42, 49-50)
    // Animal ears
    modelRef.current.setParameterValue('Param33', physics.specialFeatures.animalEars * 30);
    modelRef.current.setParameterValue('Param34', physics.specialFeatures.animalEars * 20);
    modelRef.current.setParameterValue('Param35', physics.specialFeatures.animalEars * 30);
    modelRef.current.setParameterValue('Param36', physics.specialFeatures.animalEars * 20);
    
    // Wings
    modelRef.current.setParameterValue('Param117', physics.specialFeatures.wings * 35);
    modelRef.current.setParameterValue('Param118', physics.specialFeatures.wings * 35);

  }, []);

  // Apply emotion with intensity
  const applyEmotionWithIntensity = useCallback((modelRef: Live2DModelRef, emotions: any) => {
    if (!modelRef.current) return;

    // Clear current emotion  
    if (currentEmotionRef.current) {
      modelRef.current.resetExpression();
    }

    // Apply new emotion (Live2D uses setExpression, not setExpressionValue)
    const emotionKey = EMOTION_MAP[emotions.base as keyof typeof EMOTION_MAP];
    if (emotionKey) {
      modelRef.current.setExpression(emotionKey);
      currentEmotionRef.current = emotionKey;
      
      // Log intensity for debugging (Live2D expressions don't support intensity scaling)
      if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
        console.log(`[Enhanced Controller] Applied emotion ${emotions.base} with intensity ${emotions.intensity}`);
      }
    }

    // Apply eye effect if different from base
    if (emotions.eyeEffect && emotions.eyeEffect !== 'none' && emotions.eyeEffect !== emotions.base) {
      const eyeEffectKey = EMOTION_MAP[emotions.eyeEffect as keyof typeof EMOTION_MAP];
      if (eyeEffectKey) {
        modelRef.current.setExpression(eyeEffectKey);
      }
    }
  }, []);

  // Apply enhanced decorations
  const applyEnhancedDecorations = useCallback((modelRef: Live2DModelRef, decorations: any) => {
    if (!modelRef.current) return;

    // Clear current decorations
    modelRef.current.resetExpression();
    currentDecorationsRef.current.clear();

    // Apply new decorations with intensity
    Object.entries(decorations).forEach(([type, value]) => {
      if (type === 'anger_mark' && value === true) {
        modelRef.current.setExpression('怒');
        currentDecorationsRef.current.add('怒');
      } else if (type in DECORATION_INTENSITY_MAP) {
        const intensityMap = DECORATION_INTENSITY_MAP[type as keyof typeof DECORATION_INTENSITY_MAP];
        const decorationKey = intensityMap[value as keyof typeof intensityMap];
        if (decorationKey) {
          modelRef.current.setExpression(decorationKey);
          currentDecorationsRef.current.add(decorationKey);
        }
      }
    });
  }, []);

  // Apply hand item
  const applyHandItem = useCallback((modelRef: Live2DModelRef, handItem: string) => {
    if (!modelRef.current) return;

    // Clear current hand item (handled by resetExpression in decorations)
    
    // Apply new hand item
    const itemKey = HAND_ITEM_MAP[handItem as keyof typeof HAND_ITEM_MAP];
    if (itemKey) {
      modelRef.current.setExpression(itemKey);
      currentHandItemRef.current = itemKey;
    } else {
      currentHandItemRef.current = null;
    }
  }, []);

  // Apply mouth settings
  const applyMouthSettings = useCallback((modelRef: Live2DModelRef, mouth: any) => {
    if (!modelRef.current) return;

    modelRef.current.setParameterValue('ParamMouthOpenY', mouth.openness / 50);
    modelRef.current.setParameterValue('ParamMouthForm', mouth.form / 100);
  }, []);

  // Apply mouth timeline for lip sync
  const applyMouthTimeline = useCallback((modelRef: Live2DModelRef, timeline: number[]) => {
    if (!modelRef.current || timeline.length === 0) return;

    let index = 0;
    const applyNextMouthValue = () => {
      if (!modelRef.current || index >= timeline.length) return;

      const mouthValue = timeline[index] || 0;
      modelRef.current.setParameterValue('ParamMouthOpenY', mouthValue / 50);
      
      index++;
      if (index < timeline.length) {
        mouthTimelineRef.current = setTimeout(applyNextMouthValue, 50);
      }
    };

    applyNextMouthValue();
  }, []);

  // Apply physics timeline for complex movements
  const applyPhysicsTimeline = useCallback((modelRef: Live2DModelRef, timeline: any[]) => {
    if (!modelRef.current || timeline.length === 0) return;

    let index = 0;
    const applyNextPhysics = () => {
      if (!modelRef.current || index >= timeline.length) return;

      const physicsStep = timeline[index];
      if (physicsStep) {
        // Apply all physics parameters from this step
        const mergedPhysics = {
          headMovement: physicsStep.headMovement || { x: 0, y: 0, z: 0 },
          bodyMovement: physicsStep.bodyMovement || { x: 0, y: 0, z: 0 },
          breathing: physicsStep.breathing || 0.3,
          eyeTracking: physicsStep.eyeTracking || { x: 0, y: 0 },
          eyeOpening: physicsStep.eyeOpening || { left: 1, right: 1 },
          eyebrowMovement: physicsStep.eyebrowMovement || { leftY: 0, rightY: 0, leftForm: 0, rightForm: 0 },
          hairDynamics: physicsStep.hairDynamics || { front: 0.3, side: 0.3, back: 0.3, accessories: 0.3 },
          bodyDynamics: physicsStep.bodyDynamics || { chest: 0.3, skirt: 0.3, legs: 0 },
          specialFeatures: physicsStep.specialFeatures || { animalEars: 0.5, wings: 0 }
        };
        
        applyEnhancedPhysics(modelRef, mergedPhysics);
      }

      index++;
      if (index < timeline.length) {
        const duration = physicsStep.duration || 200;
        physicsTimelineRef.current = setTimeout(applyNextPhysics, duration);
      }
    };

    applyNextPhysics();
  }, [applyEnhancedPhysics]);

  return {
    applyResponseToModel,
    clearCurrentTimelines
  };
}