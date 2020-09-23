//++++++++++++++++++++++++++++++++++++++++++++
// ENBSeries effect file
// visit http://enbdev.com for updates
// Copyright (c) 2007-2013 Boris Vorontsov
//++++++++++++++++++++++++++++++++++++++++++++

// NIGHTEYE FIX v2.4 by Scegielski author of "Enhanced ENB Night Eye" 

// KBLOOM by Kermles

// [HLSL CODE] 3D LUT by Kingeric1992

// EYE ADAPTATION BY prod80



#ifndef POSTPROCESS
 #define POSTPROCESS	2
#endif

//use original game processing first, then mine
//#define APPLYGAMECOLORCORRECTION

// #########################
// BEGIN NIGHTEYE  UTILITIES
// #########################

#include "EnhancedENBDiagnostics.fxh"

//{ Defines
#define EENE_ENABLE_CALIBRATION_DISPLAY
#define EENE_ENABLE_CC
#define EENE_ENABLE_BLOOM
#define EENE_ENABLE_NOISE
#define EENE_ENABLE_WARPING
#define EENE_ENABLE_VIGNETTE
#define EENE_ENABLE_BLUR
#define EENE_ENABLE_SHARPENING
//}

//{ Utilities
float3 EENE_RGBtoHSV(float3 c)
{
	float4 K = float4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0) ;
	float4 p = lerp(float4(c.bg, K.wz), float4(c.gb, K.xy), step(c.b, c.g));
	float4 q = lerp(float4(p.xyw, c.r), float4(c.r, p.yzx), step(p.x, c.r));

	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return float3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

float3 EENE_HSVtoRGB(float3 c)
{
	float4 K = float4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	float3 p = abs(frac(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * lerp(K.xxx, saturate(p - K.xxx), c.y);
}

float EENE_randomNoise(in float3 uvw)
{
	float3 noise = (frac(sin(dot(uvw ,float3(12.9898,78.233, 42.2442)*2.0)) * 43758.5453));
	return abs(noise.x + noise.y + noise.z) * 0.3333;
}

float EENE_linStep(float minVal, float maxVal, float t)
{
	return saturate((t - minVal) / (maxVal - minVal));
}

//}

// #########################
// END NIGHTEYE  UTILITIES
// #########################

string Param01 = "DAY";

	float	EBrightnessV2Day <
		string UIName="EBrightnessV2Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.56};

	float	EAdaptationMinV2Day <
		string UIName="EAdaptationMinV2Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.035};

	float	EAdaptationMaxV2Day <
		string UIName="EAdaptationMaxV2Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.14};

	float	EToneMappingCurveV2Day <
		string UIName="EToneMappingCurveV2Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {1.8};

	float	EIntensityContrastV2Day <
		string UIName="EIntensityContrastV2Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {1.38};

	float	EToneMappingOversaturationV2Day <
		string UIName="EToneMappingOversaturationV2Day";
		string UIWidget="Spinner";
		float UIMin=-10.0;
		float UIMax=400.0;
	> = {200.0};

	float	EColorSaturationV2Day <
		string UIName="EColorSaturationV2Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {2.05};


string Param02 = "NIGHT";

	float	EBrightnessV2Night <
		string UIName="EBrightnessV2Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.45};

	float	EAdaptationMinV2Night <
		string UIName="EAdaptationMinV2Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.045};

	float	EAdaptationMaxV2Night <
		string UIName="EAdaptationMaxV2Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.1};

	float	EToneMappingCurveV2Night <
		string UIName="EToneMappingCurveV2Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {2.0};

	float	EIntensityContrastV2Night <
		string UIName="EIntensityContrastV2Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {1.2};

	float	EToneMappingOversaturationV2Night <
		string UIName="EToneMappingOversaturationV2Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=200.0;
	> = {60.0};

	float	EColorSaturationV2Night <
		string UIName="EColorSaturationV2Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {1.3};


string Param03 = "INTERIORS";

	float	EBrightnessV2Interior <
		string UIName="EBrightnessV2Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.4};

	float	EAdaptationMinV2Interior <
		string UIName="EAdaptationMinV2Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.04};

	float	EAdaptationMaxV2Interior <
		string UIName="EAdaptationMaxV2Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {0.12};

	float	EToneMappingCurveV2Interior <
		string UIName="EToneMappingCurveV2Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {2.6};

	float	EIntensityContrastV2Interior <
		string UIName="EIntensityContrastV2Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {1.05};

	float	EToneMappingOversaturationV2Interior <
		string UIName="EToneMappingOversaturationV2Interior";
		string UIWidget="Spinner";
		float UIMin=-10.0;
		float UIMax=400.0;
	> = {160.0};

	float	EColorSaturationV2Interior <
		string UIName="EColorSaturationV2Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=50.0;
	> = {1.35};
	
	
string Param04 = "EYE ADAPTATION";

float minAdaptE <
   string UIName="Exterior Adaptation: Min";
   string UIWidget="Spinner";
   float UIMin=0.0;
   float UIMax=10.0;
   float UIStep=0.001;
> = {0.025};
float maxAdaptE <
   string UIName="Exterior Adaptation: Max";
   string UIWidget="Spinner";
   float UIMin=0.0;
   float UIMax=10.0;
   float UIStep=0.001;
> = {0.11};
float minAdaptI <
   string UIName="Interior Adaptation: Min";
   string UIWidget="Spinner";
   float UIMin=0.0;
   float UIMax=10.0;
   float UIStep=0.001;
> = {0.025};
float maxAdaptI <
   string UIName="Interior Adaptation: Max";
   string UIWidget="Spinner";
   float UIMin=0.0;
   float UIMax=8.0;
   float UIStep=0.001;
> = {0.11};
float middleGrayE <
   string UIName="Exterior Adaptation: Middle Grey";
   string UIWidget="Spinner";
   float UIMin=0.0;
   float UIMax=4.0;
   float UIStep=0.001;
> = {0.6};
float middleGrayI <
   string UIName="Interior Adaptation: Middle Grey";
   string UIWidget="Spinner";
   float UIMin=0.0;
   float UIMax=3.0;
   float UIStep=0.001;
> = {0.6};
float maxLumaE <
   string UIName="Max Exterior Luminosity";
   string UIWidget="Spinner";
   float UIMin=0.0;
   float UIMax=16.0;
   float UIStep=0.001;
> = {16.0};
float maxLumaI <
   string UIName="Max Interior Luminosity";
   string UIWidget="Spinner";
   float UIMin=0.0;
   float UIMax=16.0;
   float UIStep=0.001;
> = {16.0};
	

	float grayValue(float3 gv)
{
   return dot( gv, float3(0.2125, 0.7154, 0.0721) );
}		

	
string Param05 = "KBLOOM";
  bool ENABLE_KABLOOM <
   string UIName = "Enable KBLOOM";
> = {true};

#include "Headers/Kabloom.fxh"		




// ##########################
// BEGIN NIGHTEYE  PARAMETERS
// ##########################

string Param06 = "NIGHT VISION GLOBAL ON/OFF";
//{ Parameters
	//{ Enable
		bool EENE_Enable <
			string UIName = "---- EENE Enable ----";
		> = {true};
	//}
string Param07 = "NIGHT VISION CALIBRATION";	
	//{ Calibration Display
	#ifdef EENE_ENABLE_CALIBRATION_DISPLAY
		bool EENE_calibrateDisplayEnable <
			string UIName = "---- EENE Cal Display ----";
		> = {false};
		
		float EENE_calibrateDisplayPosX
		<
			string UIName="EENE Cal Display Position X";
			string UIWidget="Spinner";
			float UIMin=-1.0;
			float UIMax=1.0;
			float UIStep=0.01;
		> = {0.67};
		
		float EENE_calibrateDisplayPosY
		<
			string UIName="EENE Cal Display Position Y";
			string UIWidget="Spinner";
			float UIMin=-1.0;
			float UIMax=1.0;
			float UIStep=0.01;
		> = {-0.10};
	#endif // EENE_ENABLE_CALIBRATION_DISPLAY
	//}
	
	//{ Offset and Mult Calibration
	float EENE_calOffsetDay
	<
		string UIName="EENE Cal Offset Day";
		string UIWidget="Spinner";
		float UIMin=-10.0;
		float UIMax=10.0;
		float UIStep=0.01;
	> = {0.0};
	
	float EENE_calOffsetNight
	<
		string UIName="EENE Cal Offset Night";
		string UIWidget="Spinner";
		float UIMin=-10.0;
		float UIMax=10.0;
		float UIStep=0.01;
	> = {0.0};
	
	float EENE_calOffsetInterior
	<
		string UIName="EENE Cal Offset Interior";
		string UIWidget="Spinner";
		float UIMin=-10.0;
		float UIMax=10.0;
		float UIStep=0.01;
	> = {0.0};
	
	float EENE_calMultDay
	<
		string UIName="EENE Cal Mult Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
		float UIStep=0.01;
	> = {1.0};
	
	float EENE_calMultNight
	<
		string UIName="EENE Cal Mult Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
		float UIStep=0.01;
	> = {1.0};
	
	float EENE_calMultInterior
	<
		string UIName="EENE Cal Mult Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
		float UIStep=0.01;
	> = {1.0};
	//}
	
	//{ Color Range Calibration
	bool EENE_calUseColor <
		string UIName = "---- EENE Cal Use Color ----";
	> = {true};
	
	float EENE_calColorR
	<
		string UIName="EENE Cal Color R";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
		float UIStep=0.01;
	> = {0.0};
	
	float EENE_calColorG
	<
		string UIName="EENE cal Color G";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
		float UIStep=0.01;
	> = {0.0};
	
	float EENE_calColorB
	<
		string UIName="EENE Cal Color B";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
		float UIStep=0.01;
	> = {1.0};
	
	float EENE_calColorRangeMin
	<
		string UIName="EENE Cal Color Range Min";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
		float UIStep=0.01;
	> = {0.0};
	
	float EENE_calColorRangeMax
	<
		string UIName="EENE Cal Color Range Max";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
		float UIStep=0.01;
	> = {0.01};
	//}
	
	//{ Color Correction
	#ifdef EENE_ENABLE_CC
	bool EENE_enableCC<
		string UIName = "---- EENE CC ----";
	> = {true};	
	
	float EENE_CCInvertDay
	<
		string UIName = "EENE Invert Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float  EENE_CCInvertNight
	<
		string UIName = "EENE Invert Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float EENE_CCInvertInterior
	<
		string UIName = "EENE Invert Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float EENE_CCGammaDay
	<
		string UIName="EENE CC Gamma Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {0.8};
	
	float EENE_CCGammaNight
	<
		string UIName="EENE CC Gamma Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {0.8};
	
	float EENE_CCGammaInterior
	<
		string UIName="EENE CC Gamma Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {0.8};
	
	float EENE_CCHueShiftDay
	<
		string UIName="EENE CC Hue Shift Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float EENE_CCHueShiftNight
	<
		string UIName="EENE CC Hue Shift Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float EENE_CCHueShiftInterior
	<
		string UIName="EENE CC Hue Shift Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float EENE_CCSaturationDay
	<
		string UIName="EENE CC Saturation Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.5};
	
	float EENE_CCSaturationNight
	<
		string UIName="EENE CC Saturation Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.5};
	
	float EENE_CCSaturationInterior
	<
		string UIName="EENE CC Saturation Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.5};
	
	float EENE_CCValueDay
	<
		string UIName="EENE CC Value Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.5};
	
	float EENE_CCValueNight
	<
		string UIName="EENE CC Value Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.5};
	
	float EENE_CCValueInterior
	<
		string UIName="EENE CC Value Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.5};
	
	float3	EENE_CCTintColor <
		string UIName="EENE CC Tint Color";
		string UIWidget="Color";
	> = {0.4, 0.8, 1.0};
	
	float EENE_CCTintDay
	<
		string UIName="EENE CC Tint Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {1.0};
	
	float EENE_CCTintNight
	<
		string UIName="EENE CC Tint Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {1.0};
	
	float EENE_CCTintInterior
	<
		string UIName="EENE CC Tint Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {1.0};
	#endif // EENE_ENABLE_CC
	//}
	
	//{ Bloom
	#ifdef EENE_ENABLE_BLOOM
	bool EENE_enableBloom<
		string UIName = "---- EENE Bloom ----";
	> = {true};	
	
	float EENE_bloomDay
	<
		string UIName="EENE Bloom Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {2.0};
	
	float EENE_bloomNight
	<
		string UIName="EENE Bloom Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {2.0};
	
	float EENE_bloomInterior
	<
		string UIName="EENE Bloom Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {2.0};
	
	float EENE_bloomGammaDay
	<
		string UIName="EENE Bloom Gamma Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {0.65};
	
	float EENE_bloomGammaNight
	<
		string UIName="EENE Bloom Gamma Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {0.65};
	
	float EENE_bloomGammaInterior
	<
		string UIName="EENE Bloom Gamma Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {0.65};
	
		float EENE_bloomHueShiftDay
	<
		string UIName="EENE Bloom Hue Shift Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.5};
	
	float EENE_bloomHueShiftNight
	<
		string UIName="EENE Bloom Hue Shift Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.5};
	
	float EENE_bloomHueShiftInterior
	<
		string UIName="EENE Bloom Hue Shift Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.5};
	
	float EENE_bloomSaturationDay
	<
		string UIName="EENE Bloom Saturation Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {2.0};
	
	float EENE_bloomSaturationNight
	<
		string UIName="EENE Bloom Saturation Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {2.0};
	
	float EENE_bloomSaturationInterior
	<
		string UIName="EENE Bloom Saturation Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {2.0};
	
	float EENE_bloomValueDay
	<
		string UIName="EENE Bloom Value Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.0};
	
	float EENE_bloomValueNight
	<
		string UIName="EENE Bloom Value Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.0};
	
	float EENE_bloomValueInterior
	<
		string UIName="EENE Bloom Value Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=10.0;
	> = {1.0};

	float3	EENE_bloomTintColor <
		string UIName="EENE Bloom Tint Color";
		string UIWidget="Color";
	> = {0.4, 0.8, 1.0};
	
	float EENE_nightEyeBloomTintDay
	<
		string UIName="EENE Bloom Tint Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {1.0};
	
	float EENE_nightEyeBloomTintNight
	<
		string UIName="EENE Bloom Tint Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {1.0};
	
	float EENE_nightEyeBloomTintInterior
	<
		string UIName="EENE Bloom Tint Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {1.0};
	#endif // EENE_ENABLE_BLOOM
	//}

	//{ Noise
	#ifdef EENE_ENABLE_NOISE
		bool EENE_noiseEnable <
			string UIName = "---- EENE Noise ----";
		> = {true};
		
		float EENE_noiseDay
		<
			string UIName="EENE Noise Day";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=1.0;
		> = {0.05};
		
		float EENE_noiseNight
		<
			string UIName="EENE Noise Night";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=1.0;
		> = {0.05};
		
		float EENE_noiseInterior
		<
			string UIName="EENE Noise Interior";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=1.0;
		> = {0.05};
		
		float3	EENE_noiseTintColor <
		string UIName="EENE Noise Tint Color";
		string UIWidget="Color";
	> = {1.0, 1.0, 1.0};
	
	float EENE_noiseTintDay
	<
		string UIName="EENE Noise Tint Day";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float EENE_noiseTintNight
	<
		string UIName="EENE Noise Tint Night";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float EENE_noiseTintInterior
	<
		string UIName="EENE Noise Tint Interior";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=1.0;
	> = {0.0};
	
	float	EENE_noiseSpeed
	<
		string UIName="EENE Noise Speed";
		string UIWidget="Spinner";
		float UIMin=0.0;
		float UIMax=2.0;
		float UIStep=0.00001;
	> = {0.029454};
	#endif // EENE_ENABLE_NOISE
	//}
	
	//{ Vignette
	#ifdef EENE_ENABLE_VIGNETTE
		bool EENE_vignetteEnable <
			string UIName = "---- EENE Vignette ----";
		> = {true};
		
		float EENE_vignetteDay
		<
			string UIName="EENE Vignette Day";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=1.0;
		> = {1.0};
		
		float EENE_vignetteNight
		<
			string UIName="EENE Vignette Night";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=1.0;
		> = {1.0};
		
				float EENE_vignetteInterior
		<
			string UIName="EENE Vignette Interior";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=1.0;
		> = {1.0};
		
		float EENE_vignetteMinDistance
		<
			string UIName="EENE Vignette Min Distance";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {0.25};

		float EENE_vignetteMaxDistance
		<
			string UIName="EENE Vignette Max Distance";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {1.0};

		float EENE_vignetteDistancePower
		<
			string UIName="EENE Vignette Distance Power";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {1.5};

		float EENE_vignetteAspectRatio
		<
			string UIName="EENE Vignette Aspect Ratio Power";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {1.66};
	#endif // EENE_ENABLE_VIGNETTE
	//}
	
	//{ Warp
	#ifdef EENE_ENABLE_WARPING
		bool EENE_warpEnable <
			string UIName = "---- EENE Warp ----";
		> = {true};
		
		float EENE_warpDay
		<
			string UIName="Warp Day";
			string UIWidget="Spinner";
			float UIMin=-10.0;
			float UIMax=10.0;
		> = {2.0};
		
		float EENE_warpNight
		<
			string UIName="Warp Night";
			string UIWidget="Spinner";
			float UIMin=-10.0;
			float UIMax=10.0;
		> = {2.0};
		
		float EENE_warpInterior
		<
			string UIName="Warp Interior";
			string UIWidget="Spinner";
			float UIMin=-10.0;
			float UIMax=10.0;
		> = {2.0};
		
		float EENE_warpShift
		<
			string UIName="Warp Shift";
			string UIWidget="Spinner";
			float UIMin=-10.0;
			float UIMax=10.0;
		> = {0.0};
				
		float EENE_warpMinDistance
		<
			string UIName="EENE Warp Min Distance";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {0.25};
		
		float EENE_warpMaxDistance
		<
			string UIName="EENE Warp Max Distance";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {1.0};
		
		float EENE_warpDistancePower
		<
			string UIName="EENE Warp Distance Power";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {1.75};
		
		float EENE_warpAspectRatio
		<
			string UIName="EENE Warp Aspect Ratio";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {1.0};
	#endif // EENE_ENABLE_WARPING
	//}
	
	//{ Sharpening
	#ifdef EENE_ENABLE_SHARPENING
			bool EENE_sharpeningEnable <
			string UIName = "---- EENE Sharpening ----";
		>  = {true};

		int	EENE_sharpeningSamples
		<
			string UIName="EENE Sharpening Samples x 8";
			string UIWidget="Spinner";
			float UIMin=1.0;
			float UIMax=32.0;
		> = {8.0};

		float	EENE_sharpeningRadius
		<
			string UIName="EENE Sharpening Radius";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=100.0;
		> = {5.0};
		
		float EENE_sharpeningDay
			<
				string UIName="EENE Sharpening Day";
				string UIWidget="Spinner";
				float UIMin=0.0;
				float UIMax=100.0;
		> = {2.0};
		
		float EENE_sharpeningNight
		<
			string UIName="EENE Sharpening Night";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=100.0;
		> = {2.0};
		
		float EENE_sharpeningInterior
		<
			string UIName="EENE Sharpening Interior";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=100.0;
		> = {2.0};
	#endif // EENE_ENABLE_SHARPENING
	//}
	
	//{ Blur
	#ifdef EENE_ENABLE_BLUR
		bool EENE_blurEnable <
			string UIName = "---- EENE Blur ----";
		>  = {false};

		int	EENE_blurSamples
		<
			string UIName="EENE Blur Samples x 8";
			string UIWidget="Spinner";
			float UIMin=1.0;
			float UIMax=32.0;
		> = {8.0};

		float EENE_blurRadiusDay
			<
				string UIName="EENE Blur Radius Day";
				string UIWidget="Spinner";
				float UIMin=0.0;
				float UIMax=100.0;
			> = {0.0};
		
		float EENE_blurRadiusNight
		<
			string UIName="EENE Blur Radius Night";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=100.0;
		> = {0.0};
		
		float EENE_blurRadiusInterior
		<
			string UIName="EENE Blur Radius Interior";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=100.0;
		> = {0.0};
		
		bool EENE_blurMaskRadius <
			string UIName = "EENE Blur Mask Radius";
		>  = {true};
		
		bool EENE_blurMaskBlend <
			string UIName = "EENE Blur Mask Blend";
		>  = {false};
		
		float EENE_blurMaskMinDistance
		<
			string UIName="EENE Blur Mask Min Distance";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {0.0};

		float EENE_blurMaskMaxDistance
		<
			string UIName="EENE Blur Mask Max Distance";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {0.5};

		float EENE_blurMaskDistancePower
		<
			string UIName="EENE Blur Mask Distance Power";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {1.5};

		float EENE_blurMaskAspectRatio
		<
			string UIName="EENE Blur Mask Aspect Ratio Power";
			string UIWidget="Spinner";
			float UIMin=0.0;
			float UIMax=10.0;
		> = {1.66};
	#endif // EENE_ENABLE_BLUR
	//}
//}

// ##########################
// END NIGHTEYE  PARAMETERS
// ##########################


//+++++++++++++++++++++++++++++
//external parameters, do not modify
//+++++++++++++++++++++++++++++
//keyboard controlled temporary variables (in some versions exists in the config file). Press and hold key 1,2,3...8 together with PageUp or PageDown to modify. By default all set to 1.0
float4	tempF1; //0,1,2,3
float4	tempF2; //5,6,7,8
float4	tempF3; //9,0
//x=generic timer in range 0..1, period of 16777216 ms (4.6 hours), w=frame time elapsed (in seconds)
float4	Timer;
//x=Width, y=1/Width, z=ScreenScaleY, w=1/ScreenScaleY
float4	ScreenSize;
//changes in range 0..1, 0 means that night time, 1 - day time
float	ENightDayFactor;
//changes 0 or 1. 0 means that exterior, 1 - interior
float	EInteriorFactor;
//enb version of bloom applied, ignored if original post processing used
float	EBloomAmount;


texture2D texs0;//color
texture2D texs1;//bloom skyrim
texture2D texs2;//adaptation skyrim
texture2D texs3;//bloom enb
texture2D texs4;//adaptation enb
texture2D texs7;//palette enb

sampler2D _s0 = sampler_state
{
	Texture   = <texs0>;
	MinFilter = POINT;//
	MagFilter = POINT;//
	MipFilter = NONE;//LINEAR;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D _s1 = sampler_state
{
	Texture   = <texs1>;
	MinFilter = LINEAR;//
	MagFilter = LINEAR;//
	MipFilter = NONE;//LINEAR;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D _s2 = sampler_state
{
	Texture   = <texs2>;
	MinFilter = LINEAR;//
	MagFilter = LINEAR;//
	MipFilter = NONE;//LINEAR;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D _s3 = sampler_state
{
	Texture   = <texs3>;
	MinFilter = LINEAR;//
	MagFilter = LINEAR;//
	MipFilter = NONE;//LINEAR;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D _s4 = sampler_state
{
	Texture   = <texs4>;
	MinFilter = LINEAR;//
	MagFilter = LINEAR;//
	MipFilter = NONE;//LINEAR;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D _s7 = sampler_state
{
	Texture   = <texs7>;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
	MipFilter = NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

struct VS_OUTPUT_POST
{
	float4 vpos  : POSITION;
	float2 txcoord0 : TEXCOORD0;
};
struct VS_INPUT_POST
{
	float3 pos  : POSITION;
	float2 txcoord0 : TEXCOORD0;
};



//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
VS_OUTPUT_POST VS_Quad(VS_INPUT_POST IN)
{
	VS_OUTPUT_POST OUT;

	OUT.vpos=float4(IN.pos.x,IN.pos.y,IN.pos.z,1.0);

	OUT.txcoord0.xy=IN.txcoord0.xy;

	return OUT;
}


//skyrim shader specific externals, do not modify
float4	_c1 : register(c1);
float4	_c2 : register(c2);
float4	_c3 : register(c3);
float4	_c4 : register(c4);
float4	_c5 : register(c5);

float4 PS_D6EC7DD1(VS_OUTPUT_POST IN, float2 vPos : VPOS) : COLOR
{
	float4 _oC0=0.0; //output

	float4 _c6=float4(0, 0, 0, 0);
	float4 _c7=float4(0.212500006, 0.715399981, 0.0720999986, 1.0);

	float4 r0;
	float4 r1;
	float4 r2;
	float4 r3;
	float4 r4;
	float4 r5;
	float4 r6;
	float4 r7;
	float4 r8;
	float4 r9;
	float4 r10;
	float4 r11;


	float4 _v0=0.0;

	_v0.xy=IN.txcoord0.xy;
	
	
	
	
	

	



    // ##########################
	// BEGIN NIGHTEYE SETUP
	// ##########################
	//{
	// Default(Off) Values (used in Implementation section
	float EENE_nightEyeT = 0.0;
	float EENE_warpT = 0.0;
	float EENE_generalImodT = 0.0;
	float4 EENE_gameCC=tex2D(_s0, _v0.xy);
	float4 EENE_Reg1 = _c1;
	float4 EENE_Reg2 = _c2;
	float4 EENE_Reg3 = _c3;
	float4 EENE_Reg4 = _c4;
	float4 EENE_Reg5 = _c5;
	
	if (EENE_Enable)
	{
		float3 dayFactor = clamp((EENE_Reg5.w + EENE_calOffsetDay) * EENE_calMultDay, 0.0, 1.0);
		float3 nightFactor = clamp((EENE_Reg5.w + EENE_calOffsetNight) * EENE_calMultNight, 0.0, 1.0);
		float3 interiorFactor = clamp((EENE_Reg5.w + EENE_calOffsetInterior) * EENE_calMultInterior, 0.0, 1.0);
		EENE_nightEyeT = lerp(lerp(nightFactor, dayFactor, ENightDayFactor), interiorFactor, EInteriorFactor);
		
		if (EENE_calUseColor)
		{
			float redT = 	lerp(1.0, 0.0, EENE_linStep(EENE_calColorRangeMin, EENE_calColorRangeMax, abs(EENE_Reg5.x - EENE_calColorR)));
			float greenT = 	lerp(1.0, 0.0, EENE_linStep(EENE_calColorRangeMin, EENE_calColorRangeMax, abs(EENE_Reg5.y - EENE_calColorG)));
			float blueT = 	lerp(1.0, 0.0, EENE_linStep(EENE_calColorRangeMin, EENE_calColorRangeMax, abs(EENE_Reg5.z - EENE_calColorB)));
			float colorFactor = lerp(0.0, 1.0, min(min(redT, greenT), blueT));
			EENE_nightEyeT *= colorFactor;
		}
	
		// Warping
		#ifdef EENE_ENABLE_WARPING
			EENE_warpT = lerp(lerp(EENE_warpNight, EENE_warpDay, ENightDayFactor), EENE_warpInterior, EInteriorFactor);
			EENE_warpT *= EENE_nightEyeT;
			
			float2 warpedTxCoords = IN.txcoord0;
			
			if(EENE_warpT > 0 && EENE_warpEnable)
			{
				float2 center = float2(0.5, 0.5);
				float2 warpedTxCoords = IN.txcoord0;
				float2 txCorrected = float2((warpedTxCoords.x - center.x) * 
					ScreenSize.z / EENE_warpAspectRatio + center.x, warpedTxCoords.y);
				float dist = distance(txCorrected, center);
				float2 warpVector = (txCorrected - center) / dist;

				float distT = EENE_linStep(EENE_warpMinDistance, EENE_warpMaxDistance, dist);
				distT = pow(distT, EENE_warpDistancePower);
				
				warpedTxCoords += EENE_warpT * -0.05 * 
					(distT + EENE_warpShift * 0.1) * warpVector;

				// Mirror and wrap if warped beyond screen border
				warpedTxCoords = fmod(abs(warpedTxCoords), 2.0);
				if(warpedTxCoords.x > 1.0) warpedTxCoords.x = warpedTxCoords.x - 2.0 * (warpedTxCoords.x - 1.0);
				if(warpedTxCoords.y > 1.0) warpedTxCoords.y = warpedTxCoords.y - 2.0 * (warpedTxCoords.y - 1.0);

				_v0.xy = warpedTxCoords.xy;
			}
		#endif // EENE_ENABLE_WARPING
	}
	//}
	// ##########################
	// END NIGHTEYE SETUP
	// ##########################

        r1=tex2D(_s0, _v0.xy); //color

	r11=r1; //my bypass
	_oC0.xyz=r1.xyz; //for future use without game color corrections

	float hnd = ENightDayFactor;
	float pi = (1-EInteriorFactor);

#ifdef APPLYGAMECOLORCORRECTION
	//apply original
    r0.x=1.0/_c2.y;
    r1=tex2D(_s2, _v0);
    r0.yz=r1.xy * _c1.y;
    r0.w=1.0/r0.y;
    r0.z=r0.w * r0.z;
    r1=tex2D(_s0, _v0);
    r1.xyz=r1 * _c1.y;
    r0.w=dot(_c7.xyz, r1.xyz);
    r1.w=r0.w * r0.z;
    r0.z=r0.z * r0.w + _c7.w;
    r0.z=1.0/r0.z;
    r0.x=r1.w * r0.x + _c7.w;
    r0.x=r0.x * r1.w;
    r0.x=r0.z * r0.x;
    if (r0.w<0) r0.x=_c6.x;
    r0.z=1.0/r0.w;
    r0.z=r0.z * r0.x;
    r0.x=saturate(-r0.x + _c2.x);
//    r2=tex2D(_s3, _v0);//enb bloom
    r2=tex2D(_s1, _v0);//skyrim bloom
    r2.xyz=r2 * _c1.y;
    r2.xyz=r0.x * r2;
    r1.xyz=r1 * r0.z + r2;
    r0.x=dot(r1.xyz, _c7.xyz);
    r1.w=_c7.w;
    r2=lerp(r0.x, r1, _c3.x);
    r1=r0.x * _c4 - r2;
    r1=_c4.w * r1 + r2;
    //r1=_c3.w * r1 - r0.y; //khajiit night vision _c3.w
    r1= r1 - r0.y; // khajiit night vision _c3.w OFF
    r0=_c3.z * r1 + r0.y;
    r1=-r0 + _c5;
    _oC0=_c5.w * r1 + r0;


#endif //APPLYGAMECOLORCORRECTION

/*
#ifndef APPLYGAMECOLORCORRECTION
//temporary fix for khajiit night vision, but it also degrade colors.
//	r1=tex2D(_s2, _v0);
//	r0.y=r1.xy * _c1.y;
	r1=_oC0;
	r1.xyz=r1 * _c1.y;
	r0.x=dot(r1.xyz, _c7.xyz);
	r2=lerp(r0.x, r1, _c3.x);
	r1=r0.x * _c4 - r2;
	r1=_c4.w * r1 + r2;
	r1=_c3.w * r1;// - r0.y;
	r0=_c3.z * r1;// + r0.y;
	r1=-r0 + _c5;
	_oC0=_c5.w * r1 + r0;
#endif //!APPLYGAMECOLORCORRECTION
*/

	float4 color=_oC0;


	
	//adaptation in time
	float4	Adaptation=tex2D(_s4, 0.5);
	float	grayadaptation=max(max(Adaptation.x, Adaptation.y), Adaptation.z);
   ////////////////////////////////////
   //         Eye Adaptation         //
   ////////////////////////////////////
   //Based on work by Rim van Wersch, sorta
   float minAdapt      = lerp( minAdaptE, minAdaptI, EInteriorFactor );
   float maxAdapt      = lerp( maxAdaptE, maxAdaptI, EInteriorFactor );
   float middleGray   = lerp( middleGrayE, middleGrayI, EInteriorFactor );
   float maxLuma      = lerp( maxLumaE, maxLumaI, EInteriorFactor );
   
   float EyeAdapt      = grayValue( tex2D( _s4, 0.5 ).xyz );
   float pixelLuma      = grayValue( color.xyz );
   EyeAdapt         = clamp( EyeAdapt, minAdapt, maxAdapt );
   
   float scaledLuma   = ( pixelLuma * middleGray ) / EyeAdapt;
   float compLuma      = ( scaledLuma * ( 1.0f + ( scaledLuma / ( maxLuma * maxLuma )))) / ( 1.0f + scaledLuma );
   
   color.xyz         *= compLuma;

//-/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
 if (ENABLE_KABLOOM==true)
  {
    	color.rgb = kaBloom(_s3,_v0,color,InBlack,InWhite,InGamma,OutBlack,OutWhite,BloomBrightness,BloomContrast,BloomSaturation,BloomSensitivity,BloomIntensity,RGBBalance,RGBWeights,BlendMode,BlendAmount,BlendOpacity);
  }

//-/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
    float4	xcolorbloom=tex2D(_s3, _v0.xy); //bloom

	color.xyz+=xcolorbloom.xyz*EBloomAmount;


//-/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



#if (POSTPROCESS==2)

	float newEAdaptationMax = lerp( EAdaptationMaxV2Interior, ( lerp( EAdaptationMaxV2Night, EAdaptationMaxV2Day, hnd ) ), pi );
	float newEAdaptationMin = lerp( EAdaptationMinV2Interior, ( lerp( EAdaptationMinV2Night, EAdaptationMinV2Day, hnd ) ), pi );
	float newEBrightnessV2 = lerp( EBrightnessV2Interior, ( lerp( EBrightnessV2Night, EBrightnessV2Day, hnd ) ), pi );
	float newEToneMappingCurve = lerp( EToneMappingCurveV2Interior, ( lerp( EToneMappingCurveV2Night, EToneMappingCurveV2Day, hnd ) ), pi );
	float newEIntensityContrastV2 = lerp( EIntensityContrastV2Interior, ( lerp( EIntensityContrastV2Night, EIntensityContrastV2Day, hnd ) ), pi );
	float newEToneMappingOversaturationV2 = lerp( EToneMappingOversaturationV2Interior, ( lerp( EToneMappingOversaturationV2Night, EToneMappingOversaturationV2Day, hnd ) ), pi );
	float newEColorSaturationV2 = lerp( EColorSaturationV2Interior, ( lerp( EColorSaturationV2Night, EColorSaturationV2Day, hnd ) ), pi );

	grayadaptation=max(grayadaptation, 0.0);
	grayadaptation=min(grayadaptation, 50.0);
	color.xyz=color.xyz/(grayadaptation*newEAdaptationMax+newEAdaptationMin);//*tempF1.x

	color.xyz*=(newEBrightnessV2);
	color.xyz+=0.000001;
	float3 xncol=normalize(color.xyz);
	float3 scl=color.xyz/xncol.xyz;
	scl=pow(scl, newEIntensityContrastV2);
	xncol.xyz=pow(xncol.xyz, newEColorSaturationV2);
	color.xyz=scl*xncol.xyz;

	float	lumamax=newEToneMappingOversaturationV2;
	color.xyz=(color.xyz * (1.0 + color.xyz/lumamax))/(color.xyz + newEToneMappingCurve);
	
	

#endif

//-/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//-/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//LUT)
#ifdef E_CC_PALETTE
float2 CLut_pSize = float2(0.00390625, 0.0625);// 1 / float2(256, 16);
color.rgb  = saturate(color.rgb);
color.b   *= 15;
float4 CLut_UV = 0;
CLut_UV.w  = floor(color.b);
CLut_UV.xy = color.rg * 15 * CLut_pSize + 0.5 * CLut_pSize ;
CLut_UV.x += CLut_UV.w * CLut_pSize.y;
color.rgb  = lerp( tex2Dlod(_s7, CLut_UV.xyzz).rgb, tex2Dlod(_s7, CLut_UV.xyzz + float4(CLut_pSize.y, 0, 0, 0)).rgb, color.b - CLut_UV.w);
#endif //E_CC_PALETTE


     // ##############################
	// BEGIN NIGHTEYE  IMPLEMENTATION
	// ##############################
	//{ Implementation
	if (EENE_Enable)
	{
		//{ Night Eye
		if (EENE_nightEyeT > 0.0)
		{
			float3 nightEye = color.xyz;
			
			// For Blur and Sharpening
			float4 sampleCoord = float4(0.0, 0.0, 0.0, 1.0);
			float2 offsets[8] =
			{
				 float2(	0.00000 ,   1.00000	), // 0
				 float2(	0.70711 ,   0.70711	), // 45
				 float2(	1.00000 ,   0.00000	), // 90
				 float2(	0.70711 , -0.70711	), // 135
				 float2(	0.00000 ,	-1.00000	), // 180
				 float2( -0.70711 , -0.70711	), // 225
				 float2( -1.00000 , -0.00000	), // 270
				 float2( -0.70711 ,   0.70711	), // 315
			};
			float inverseScreenSize = 1.0 / ScreenSize;
			
			//{ Sharpening
				#ifdef  EENE_ENABLE_SHARPENING
				if (EENE_sharpeningEnable)
				{
					float sharpAmount = lerp(lerp(EENE_sharpeningNight, EENE_sharpeningDay, ENightDayFactor), EENE_sharpeningInterior, EInteriorFactor);

					float3 sharpColor = nightEye;
					for (int i = 0; i < EENE_sharpeningSamples; i++)
					{
						int index = i % 8;
						float iter = 1.0 + ( float ) floor (( float )i / 8.0); // Which time around the offsets + 1
						float distT = iter / EENE_sharpeningSamples;  // 0..1
						float dist = distT * EENE_sharpeningRadius;
						float2 sampleOffset = offsets[index] * dist;
						sampleCoord.xy = _v0.xy + sampleOffset.xy * inverseScreenSize * EENE_sharpeningRadius;
						sharpColor += tex2Dlod(_s0, sampleCoord);
					}
					sharpColor /= EENE_sharpeningSamples + 1;
					sharpColor = nightEye * (1.0 + ((nightEye - sharpColor) * sharpAmount));	
					float rGray = max(nightEye.r, max(nightEye.g, nightEye.b));
					sharpColor = lerp(sharpColor, nightEye, saturate(rGray));
					nightEye = sharpColor;
				}
				#endif // EENE_ENABLE_SHARPENING
			//}
			
			//{ Blur
				#ifdef EENE_ENABLE_BLUR
				if (EENE_blurEnable)
				{
					float2 center = float2(0.5, 0.5);
					float2 txCorrected = float2((IN.txcoord0.x - center.x) * 
						ScreenSize.z / EENE_blurMaskAspectRatio + center.x, IN.txcoord0.y);
					float distT = EENE_linStep(EENE_blurMaskMinDistance, EENE_blurMaskMaxDistance, distance(txCorrected, center));
					float blurMask = pow(distT, EENE_blurMaskDistancePower);
				
					float blurRadius = lerp(lerp(EENE_blurRadiusNight, EENE_blurRadiusDay, ENightDayFactor), EENE_blurRadiusInterior, EInteriorFactor);

					float3 blurColor = nightEye;
					for (int i = 0; i < EENE_blurSamples; i++)
					{
						int index = i % 8;
						float iter = 1.0 + ( float ) floor (( float )i / 8.0); // Which time around the offsets + 1
						float distT = iter / EENE_blurSamples;  // 0..1
						float dist = distT * blurRadius;
						float2 sampleOffset = offsets[index] * dist;
						if (EENE_blurMaskRadius)
							sampleCoord.xy = _v0.xy + sampleOffset.xy * inverseScreenSize * blurRadius * blurMask;
						else
							sampleCoord.xy = _v0.xy + sampleOffset.xy * inverseScreenSize * blurRadius;

						blurColor += tex2Dlod(_s0, sampleCoord);
					}
					blurColor /= EENE_blurSamples + 1;

					if (EENE_blurMaskBlend)
						nightEye = lerp(nightEye, blurColor, blurMask);
					else
						nightEye = blurColor;
				}
				#endif  // EENE_ENABLE_BLUR
			//}
			
			//{ CC
				#ifdef EENE_ENABLE_CC
				if (EENE_enableCC)
				{
					float invertCC  = lerp(lerp(EENE_CCInvertNight, EENE_CCInvertDay, ENightDayFactor), EENE_CCInvertInterior, EInteriorFactor);
					float gammaCC = lerp(lerp(EENE_CCGammaNight, EENE_CCGammaDay, ENightDayFactor), EENE_CCGammaInterior, EInteriorFactor);
					float hueShiftCC = lerp(lerp(EENE_CCHueShiftNight, EENE_CCHueShiftDay, ENightDayFactor), EENE_CCHueShiftInterior, EInteriorFactor);
					float saturationCC = lerp(lerp(EENE_CCSaturationNight, EENE_CCSaturationDay, ENightDayFactor), EENE_CCSaturationInterior, EInteriorFactor);
					float valueCC = lerp(lerp(EENE_CCValueNight, EENE_CCValueDay, ENightDayFactor), EENE_CCValueInterior, EInteriorFactor);
					float tintCC = lerp(lerp(EENE_CCTintNight, EENE_CCTintDay, ENightDayFactor), EENE_CCTintInterior, EInteriorFactor);
					
					nightEye = lerp(nightEye, 1.0 - nightEye, invertCC);
					nightEye = pow(nightEye, gammaCC);
					nightEye = EENE_RGBtoHSV(nightEye);
					nightEye.x += hueShiftCC;
					nightEye.y *= saturationCC;
					nightEye.z *= valueCC;
					nightEye = EENE_HSVtoRGB(nightEye);
					nightEye = lerp(nightEye, nightEye * EENE_CCTintColor, tintCC);
				}
				#endif // EENE_ENABLE_CC
				//}
				
			//{ Bloom
				#ifdef EENE_ENABLE_BLOOM
				if (EENE_enableBloom)
				{
					float bloom = lerp(lerp(EENE_bloomNight, EENE_bloomDay, ENightDayFactor), EENE_bloomInterior, EInteriorFactor);
					float gammaBloom = lerp(lerp(EENE_bloomGammaNight, EENE_bloomGammaDay, ENightDayFactor), EENE_bloomGammaInterior, EInteriorFactor);
					float hueShiftBloom = lerp(lerp(EENE_bloomHueShiftNight, EENE_bloomHueShiftDay, ENightDayFactor), EENE_bloomHueShiftInterior, EInteriorFactor);
					float saturationBloom = lerp(lerp(EENE_bloomSaturationNight, EENE_bloomSaturationDay, ENightDayFactor), EENE_bloomSaturationInterior, EInteriorFactor);
					float valueBloom = lerp(lerp(EENE_bloomValueNight, EENE_bloomValueDay, ENightDayFactor), EENE_bloomValueInterior, EInteriorFactor);
					float tintBloom = lerp(lerp(EENE_nightEyeBloomTintNight, EENE_nightEyeBloomTintDay, ENightDayFactor), EENE_nightEyeBloomTintInterior, EInteriorFactor);
					
					float3 nightEyeBloom = tex2D(_s3, _v0);
					nightEyeBloom = pow(nightEyeBloom, gammaBloom);
					nightEyeBloom = EENE_RGBtoHSV(nightEyeBloom);
					nightEyeBloom.x += hueShiftBloom;
					nightEyeBloom.y *= saturationBloom;
					nightEyeBloom.z *= valueBloom;
					nightEyeBloom = EENE_HSVtoRGB(nightEyeBloom);
					nightEyeBloom = lerp(nightEyeBloom, nightEyeBloom * EENE_bloomTintColor, tintBloom) * bloom;
					nightEye += nightEyeBloom;
				}
				#endif // EENE_ENABLE_BLOOM
				//}
				
			//{ Noise
			#ifdef EENE_ENABLE_NOISE
			if (EENE_noiseEnable)
			{
				float3 noiseVal = 0.0;
				float tintNoise= lerp(lerp(EENE_noiseTintNight, EENE_noiseTintDay, ENightDayFactor), EENE_noiseTintInterior, EInteriorFactor);
				float noiseAmount = lerp(lerp(EENE_noiseNight, EENE_noiseDay, ENightDayFactor), EENE_noiseInterior, EInteriorFactor);
				
				float3 noise = EENE_randomNoise(float3(_v0.x, _v0.y, Timer.x  *EENE_noiseSpeed ));
				noise = lerp(noise, noise * EENE_noiseTintColor, tintNoise);
				noise *= noiseAmount;
				nightEye += noise;
			}
			#endif // EENE_ENABLE_NOISE
			//}
			
			//{ Vignette
			#ifdef EENE_ENABLE_VIGNETTE
			if (EENE_vignetteEnable)
			{
				float vignetteBlend = lerp(lerp(EENE_vignetteNight, EENE_vignetteDay, ENightDayFactor), EENE_vignetteInterior, EInteriorFactor);
				float2 center = float2(0.5, 0.5);
				float2 txCorrected = float2((IN.txcoord0.x - center.x) * 
					ScreenSize.z / EENE_vignetteAspectRatio + center.x, IN.txcoord0.y);
				float distT = EENE_linStep(EENE_vignetteMaxDistance, EENE_vignetteMinDistance, distance(txCorrected, center));
				float vignette = pow(distT, EENE_vignetteDistancePower);
				nightEye = lerp(nightEye, nightEye * vignette, vignetteBlend);
			}
			#endif // EENE_ENABLE_VIGNETTE
			//}
			
			color.xyz = lerp(color, nightEye, EENE_nightEyeT);
		}
		//}
	
		//{ Calibration Display
		#ifdef EENE_ENABLE_CALIBRATION_DISPLAY
		if (EENE_calibrateDisplayEnable)
		{
			float2 calibrateCoords = IN.txcoord0 + 
				float2(-EENE_calibrateDisplayPosX, EENE_calibrateDisplayPosY);
			float4 calibrateText = 0;

			calibrateText += float4(1.0, 1.0, 1.0, 1.0) *
				EED_drawFloatText(
				//ASCII N   i    g    h
				float4(78, 105, 103, 104),  	
				// ACII t    E   y    e
				float4(116, 69, 121, 101),  	
				EENE_nightEyeT,
				calibrateCoords,
				float2(0.0, -0.05),
				1.2,
				3 // precision
			);
			
			calibrateText += EED_drawFloatText(
				//ASCII N   i    g    h
				float4(78, 105, 103, 104),  	
				// ACII t    D   a    y
				float4(116, 68, 97, 121),  	
				ENightDayFactor,
				calibrateCoords,
				float2(0.0, 0.065),
				1.0,
				3 // precision
			);

			calibrateText += EED_drawFloatText(
				//ASCII I   n    t    e
				float4(73, 110, 116, 101),  	
				// ACII r    i   o    r
				float4(114, 105, 111, 114),  	
				EInteriorFactor,
				calibrateCoords,
				float2(0.0, 0.085),
				1.0,
				3 // precicsion
			);
			
			calibrateText += EED_drawCRegistersText(
				EENE_Reg1, EENE_Reg2, EENE_Reg3, EENE_Reg4, EENE_Reg5,
				calibrateCoords, float2(0.0, 0.125), 1.0, 3
			);

			float2 regSize = 100.0 * float2(ScreenSize.y * ScreenSize.w, ScreenSize.y);
			color.xyz = EED_drawCRegistersColors(
				color.xyz,
				EENE_Reg1, EENE_Reg2, EENE_Reg3, EENE_Reg4, EENE_Reg5,
				IN.txcoord0, float2(EENE_calibrateDisplayPosX + 0.115, -EENE_calibrateDisplayPosY + 0.15),
				regSize, float2(0.05, 0.1)
			);
			
			color.xyz += calibrateText.xyz;
		}
		#endif  // EENE_ENABLE_CALIBRATION_DISPLAY
		//}

	}
	//}
	// ##############################
	// END NIGHTEYE  IMPLEMENTATION
	// ##############################


	_oC0.w=1.0;
	_oC0.xyz=color.xyz;
	return _oC0;
}



//switch between vanilla and mine post processing
#ifndef ENB_FLIPTECHNIQUE
technique Shader_D6EC7DD1
#else
technique Shader_ORIGINALPOSTPROCESS
#endif
{
	pass p0
	{
		VertexShader  = compile vs_3_0 VS_Quad();
		PixelShader  = compile ps_3_0 PS_D6EC7DD1();

		ColorWriteEnable=ALPHA|RED|GREEN|BLUE;
		ZEnable=FALSE;
		ZWriteEnable=FALSE;
		CullMode=NONE;
		AlphaTestEnable=FALSE;
		AlphaBlendEnable=FALSE;
		SRGBWRITEENABLE=FALSE;
	}
}



//original shader of post processing
#ifndef ENB_FLIPTECHNIQUE
technique Shader_ORIGINALPOSTPROCESS
#else
technique Shader_D6EC7DD1
#endif
{
	pass p0
	{
		VertexShader  = compile vs_3_0 VS_Quad();
		PixelShader=
	asm
	{


    ps_3_0
    def c6, 0, 0, 0, 0
    //was c0 originally
    def c7, 0.212500006, 0.715399981, 0.0720999986, 1
    dcl_texcoord v0.xy
    dcl_2d s0
    dcl_2d s1
    dcl_2d s2
    rcp r0.x, c2.y
    texld r1, v0, s2
    mul r0.yz, r1.xxyw, c1.y
    rcp r0.w, r0.y
    mul r0.z, r0.w, r0.z
    texld r1, v0, s1
    mul r1.xyz, r1, c1.y
    dp3 r0.w, c7, r1
    mul r1.w, r0.w, r0.z
    mad r0.z, r0.z, r0.w, c7.w
    rcp r0.z, r0.z
    mad r0.x, r1.w, r0.x, c7.w
    mul r0.x, r0.x, r1.w
    mul r0.x, r0.z, r0.x
    cmp r0.x, -r0.w, c6.x, r0.x
    rcp r0.z, r0.w
    mul r0.z, r0.z, r0.x
    add_sat r0.x, -r0.x, c2.x
    texld r2, v0, s0
    mul r2.xyz, r2, c1.y
    mul r2.xyz, r0.x, r2
    mad r1.xyz, r1, r0.z, r2
    dp3 r0.x, r1, c7
    mov r1.w, c7.w
    lrp r2, c3.x, r1, r0.x
    mad r1, r0.x, c4, -r2
    mad r1, c4.w, r1, r2
    mad r1, c3.w, r1, -r0.y
    mad r0, c3.z, r1, r0.y
    add r1, -r0, c5
    mad oC0, c5.w, r1, r0
	};
		ColorWriteEnable=ALPHA|RED|GREEN|BLUE;
		ZEnable=FALSE;
		ZWriteEnable=FALSE;
		CullMode=NONE;
		AlphaTestEnable=FALSE;
		AlphaBlendEnable=FALSE;
		SRGBWRITEENABLE=FALSE;
    }
}