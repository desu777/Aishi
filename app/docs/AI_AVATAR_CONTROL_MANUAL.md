# Live2D Avatar AI Control Manual - 水母 (Jellyfish) Model

## Overview
This document provides comprehensive instructions for AI to control the Live2D avatar model. The AI acts as the "soul" of the character, controlling all visual aspects including emotions, accessories, gestures, physics, and speech.

## Initial State (AI Mode)
When `NEXT_PUBLIC_LIVE2MODEL_AI=true`:
- Avatar looks straight at the viewer (does NOT follow cursor)
- Default accessories: `jacket` = ON
- Default decorations: `crossPin` = OFF, `linePin` = OFF

## JSON Response Schema
AI must respond with the following JSON structure:

```json
{
  "text": "string - what the avatar says",
  "emotions": {
    "base": "emotion_id or 'none'",
    "eyeEffect": "eye_effect_id or 'none'"
  },
  "mouth": {
    "openness": 0-100,        // 0=closed, 100=fully open
    "form": -100 to 100,      // -100=sad, 0=neutral, 100=happy
    "lipSync": true/false     // sync with speech
  },
  "accessories": {
    "eyepatch": true/false,
    "jacket": true/false,     // default: true
    "wings": true/false,
    "gaming": true/false,
    "mic": true/false,
    "tea": true/false,
    "catEars": true/false,
    "devil": true/false,
    "halo": true/false
  },
  "decorations": {
    "flowers": true/false,
    "crossPin": true/false,   // default: false
    "linePin": true/false,    // default: false
    "bow": true/false
  },
  "specialFX": {
    "heart": true/false,
    "board": true/false,
    "colorChange": true/false,
    "touch": true/false,
    "watermark": true/false,
    "haloColorChange": true/false,
    "wingsToggle": true/false
  },
  "physics": {
    "headMovement": {
      "x": -30 to 30,         // left/right
      "y": -30 to 30,         // up/down
      "z": -10 to 10          // tilt
    },
    "bodyMovement": {
      "x": -30 to 30,
      "y": -30 to 30,
      "z": -10 to 10
    },
    "breathing": 0 to 1,      // 0.3=calm, 0.8=excited
    "eyeTracking": {
      "x": -1 to 1,
      "y": -1 to 1
    }
  },
  "formPreset": "angel/devil/neutral or null"
}
```

## High-Level Commands

### 1. Emotions (Exclusive - only one at a time)
| ID | Chinese | English | Description |
|----|---------|---------|-------------|
| `love` | 爱心眼 | Love Eyes | Heart-shaped eyes |
| `star` | 星星眼 | Star Eyes | Excited star eyes |
| `angry` | 生气 | Angry | Angry expression |
| `cry` | 哭哭 | Crying | Crying with tears |
| `dark` | 黑脸 | Dark Face | Dark, gloomy expression |
| `blush` | 脸红 | Blushing | Red cheeks, embarrassed |
| `blank` | 空白眼 | Blank Eyes | Empty stare |
| `dizzy` | 蚊香眼 | Dizzy Eyes | Spiral eyes, confused |
| `none` | - | None | Neutral expression |

### 2. Eye Effects (Exclusive - only one at a time)
| ID | Chinese | English | Description |
|----|---------|---------|-------------|
| `love` | 爱心眼 | Love Eyes | Hearts in eyes |
| `star` | 星星眼 | Star Eyes | Stars in eyes |
| `none` | - | None | No eye effect |

### 3. Accessories (Additive - can have multiple)
| ID | Chinese | English | Default | Conflicts |
|----|---------|---------|---------|-----------|
| `eyepatch` | 眼罩 | Eyepatch | OFF | - |
| `jacket` | 外套 | Jacket | **ON** | - |
| `wings` | 翅膀 | Wings | OFF | - |
| `gaming` | 游戏机 | Gaming Console | OFF | - |
| `mic` | 麦克风 | Microphone | OFF | - |
| `tea` | 茶杯 | Tea Cup | OFF | - |
| `catEars` | 猫耳 | Cat Ears | OFF | - |
| `devil` | 恶魔角 | Devil Horns | OFF | **Conflicts with `halo`** |
| `halo` | 光环 | Halo | OFF | **Conflicts with `devil`** |

### 4. Decorations (Additive - can have multiple)
| ID | Chinese | English | Default |
|----|---------|---------|---------|
| `flowers` | 花花 | Flowers | OFF |
| `crossPin` | 十字发夹 | Cross Pin | **OFF** |
| `linePin` | 一字发夹 | Line Pin | **OFF** |
| `bow` | 蝴蝶结 | Bow | OFF |

### 5. Special Effects (Additive - can have multiple)
| ID | Chinese | English | Description |
|----|---------|---------|-------------|
| `heart` | 比心 | Heart Gesture | Makes heart shape with hands |
| `board` | 写字板 | Writing Board | Shows a writing board |
| `colorChange` | 换色 | Color Change | Changes avatar colors |
| `touch` | 点触 | Touch Effect | Touch interaction effect |
| `watermark` | 水印 | Watermark | Shows watermark |
| `haloColorChange` | 光环换色 | Halo Color Change | Changes halo colors |
| `wingsToggle` | 翅膀切换 | Wings Toggle | Switches wing styles |

### 6. Form Presets (Overrides individual settings)
| Preset | Applied | Removed |
|--------|---------|---------|
| `angel` | halo, wings | devil, wingsToggle, colorChange |
| `devil` | devil, wings, wingsToggle, colorChange | halo, haloColorChange |
| `neutral` | - | halo, devil, wings, colorChange |

## Low-Level Parameters

### Mouth Control
- **ParamMouthOpenY** (`mouth.openness`): 0-100
  - 0 = Completely closed
  - 50 = Half open
  - 100 = Fully open
- **ParamMouthForm** (`mouth.form`): -100 to 100
  - -100 = Sad (downturned corners)
  - 0 = Neutral
  - 100 = Happy (wide smile)

### Head Movement
- **ParamAngleX** (`physics.headMovement.x`): -30 to 30
  - Negative = Turn left
  - Positive = Turn right
- **ParamAngleY** (`physics.headMovement.y`): -30 to 30
  - Negative = Look down
  - Positive = Look up
- **ParamAngleZ** (`physics.headMovement.z`): -10 to 10
  - Negative = Tilt left
  - Positive = Tilt right

### Body Movement
- **ParamBodyAngleX** (`physics.bodyMovement.x`): -30 to 30
- **ParamBodyAngleY** (`physics.bodyMovement.y`): -30 to 30
- **ParamBodyAngleZ** (`physics.bodyMovement.z`): -10 to 10

### Other Parameters
- **ParamBreath** (`physics.breathing`): 0 to 1
  - 0.3 = Calm breathing
  - 0.6 = Normal breathing
  - 0.8 = Excited/heavy breathing
- **ParamEyeBallX/Y** (`physics.eyeTracking.x/y`): -1 to 1
  - Controls eye direction
- **ParamBrowLY/RY**: Eyebrow movement (left/right)
- **ParamCheek**: Cheek puffing

## Rules and Constraints

### Expression Categories
1. **Exclusive Categories** (only one active):
   - Emotions (cry, angry, blush, etc.)
   - Eye Effects (love, star)
   - Held Items (mic, tea, gaming, board, bow)
   - Wings variants
   - Color transforms

2. **Additive Categories** (multiple allowed):
   - Head Accessories (catEars, flowers, pins, halo, devil)
   - Face Accessories (eyepatch)
   - Clothing (jacket)
   - Special Effects (heart, touch, watermark)

### Conflicts
- **halo** and **devil** cannot be active simultaneously
- When applying a form preset, it overrides conflicting expressions

### Behavior Guidelines
1. Always look at viewer (not cursor) in AI mode
2. Default state has jacket ON, crossPin/linePin OFF
3. Adjust breathing based on emotional state
4. Use head tilt to express curiosity/confusion
5. Combine expressions for complex emotions

## Example Responses

### Happy Greeting
```json
{
  "text": "Hello! So happy to see you! ",
  "emotions": {"base": "love", "eyeEffect": "star"},
  "mouth": {"openness": 60, "form": 80, "lipSync": true},
  "accessories": {"catEars": true},
  "physics": {
    "headMovement": {"x": 5, "y": 0, "z": 3},
    "breathing": 0.7
  }
}
```

### Sad Response
```json
{
  "text": "Oh no... what happened? ",
  "emotions": {"base": "cry", "eyeEffect": "none"},
  "mouth": {"openness": 20, "form": -70, "lipSync": true},
  "accessories": {"tea": true},
  "physics": {
    "headMovement": {"x": 0, "y": -5, "z": -2},
    "breathing": 0.4
  }
}
```

### Angel Form with Heart Gesture
```json
{
  "text": "Sending you love! ",
  "formPreset": "angel",
  "emotions": {"base": "love"},
  "mouth": {"openness": 80, "form": 100, "lipSync": true},
  "specialFX": {"heart": true},
  "physics": {
    "headMovement": {"x": 0, "y": 5, "z": 0},
    "breathing": 0.8
  }
}
```

## Physics System Overview
The model has 50 physics groups controlling:
- Hair physics (multiple strands)
- Jellyfish tentacles
- Clothing physics
- Accessory physics
- Wing movement
- Halo floating
- 600+ mesh deformers

Movement is achieved through parameter manipulation, not predefined dance animations. The avatar can sway left/right through body angle parameters.

## Important Notes
1. The model has only one motion: "Idle"
2. All expression files use additive blending
3. Physics are affected by gravity (Y: -1) and can be influenced by movement parameters
4. When `lipSync` is true, mouth movements will override `openness` to sync with speech