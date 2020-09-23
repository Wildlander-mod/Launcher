/**CC BY-SA 4.0 Kermles (Graham E. Hemsley) 06/17/14 14:15
 =======================================================================================================================
	------------------------------------------------------------------------------------------------------------
	Kabloom! Kermles was here~! Thanks to prod80 for assistance and many others around enbdev and web for ideas!
	Find me on enbdev.com and nexusmods.com if you need help or want to let me know what you think!
	------------------------------------------------------------------------------------------------------------
	Credits:
	Prod80
	Darel Rex Finley
	Boris Vorontsov
	------------------------------------------------------------------------------------------------------------
	This file and its contents are licensed under Creative Commons Attribution-ShareAlike 4.0 International
	Usage, modification and redistribution of this file is permitted under the terms of this license
	http://creativecommons.org/licenses/by-sa/4.0/
	------------------------------------------------------------------------------------------------------------
 =======================================================================================================================
 **/
/*
 * Blend modes:
 * 0: Off
 * 1: Addition
 * 2: Opacity
 * 3: Lighten
 * 4: Lighten/opacity hybrid
 * 5: Luma-based
 * 6: Screen/add hybrid
 * 7: Screen/opacity hybrid
 * 8: Screen/lighten/opacity hybrid
 */
 /*
 =======================================================================================================================
    Globals
 =======================================================================================================================
 */
 
 //===================================================================================================================//
float InBlack	/* Any bloom darker than this will map to the minimum output value */
	<
		string  UIName = "Kabloom levels: black input" ; string  UIWidget = "Slider" ; float UIMin = 0.0f; float UIMax = 1.0f;
	> = { 0.0f };	/** This number sets the default value, keep it below UIMin and UIMax **/
 //===================================================================================================================//
float InWhite	/* Any bloom brighter than this will map to the maximum output value */
	<	
		string UIName = "Kabloom levels: white input" ; string UIWidget = "Slider" ; float UIMin = 0.0f; float UIMax = 1.0f;
	> = { 1.0f };
 //===================================================================================================================//
float InGamma	/* Preprocessing gamma curve */
	<	
		string UIName = "Kabloom levels: input gamma" ; string UIWidget = "Spinner" ; float UIMin = 0.0f; float UIMax = 10.0f;
	> = { 1.0f };
 //===================================================================================================================//
float OutBlack	/* Minimum preprocessing bloom output */
	<	
		string UIName = "Kabloom levels: black output" ; string UIWidget = "Slider" ; float UIMin = 0.0f; float UIMax = 1.0f;
	> = { 0.0f };
 //===================================================================================================================//
float OutWhite	/* Maximum preprocessing bloom output */
	<	
		string UIName = "Kabloom levels: white output" ; string UIWidget = "Slider" ; float UIMin = 0.0f; float UIMax = 1.0f;
	> = { 1.0f };
 //===================================================================================================================//
float BloomBrightness	/* Controls bloom intensity before haze reduction */
	<	
		string UIName = "Kabloom spread control: input intensity" ; string UIWidget = "Spinner" ; float UIMin = -100.0f; float UIMax = 100.0f;
	> = { 0.0f };
 //===================================================================================================================//
 float BloomSaturation	/* Determines how colorful bloom looks */
	<	
		string UIName = "Kabloom spread control: saturation" ; string UIWidget = "Slider" ; float UIMin = 0.0f; float UIMax = 10.0f;
	> = { 1.0f };
 //===================================================================================================================//
float BloomContrast	/* Controls bloom contrast */
	<	
		string UIName = "Kabloom spread control: contrast" ; string UIWidget = "Spinner" ; float UIMin = 0.0f; float UIMax = 100.0f;
	> = { 1.0f };
 //===================================================================================================================//
float BloomSensitivity	/* Reduces haze based on brightness */
	<	
		string UIName = "Kabloom spread control: sensitivity" ; string UIWidget = "Spinner" ; float UIMin = 0.0f; float UIMax = 100.0f;
	> = { 1.0f };
 //===================================================================================================================//
float BloomIntensity	/* Controls bloom intensity after to haze reduction */
	<	
		string UIName = "Kabloom spread control: output intensity" ; string UIWidget = "Spinner" ; float UIMin = -100.0f; float UIMax = 100.0f;
	> = { 0.0f };
 //===================================================================================================================//
float3 RGBBalance	/* Strength of red channel */
	<	
		string UIName = "Kabloom color control: color balance" ; string UIWidget = "Color" ; float UIMin = 0.0f; float UIMax = 1.0f;
> = { float3(1.0f, 1.0f, 1.0f) };
 //===================================================================================================================//
float3 RGBWeights		/* How much red in the scene will be bloomed */
	<	
		string UIName = "Kabloom misc: bloom strength weights" ; string UIWidget = "Color" ; float UIMin = 0.0f; float UIMax = 1.0f;
> = { float3(0.0, 0.0f, 0.0f) };
 //===================================================================================================================//
int BlendMode	/* Decides how the bloom gets added to the scene */
	<	
		string UIName = "Kabloom blending: blend mode" ; string UIWidget = "Slider" ; float UIMin = 0; float UIMax = 8;
	> = { 1 };
 //===================================================================================================================//
float BlendAmount	/* Controls opacity for certain blend modes */
	<	
		string UIName = "Kabloom blending: blend amount" ; string UIWidget = "Slider" ; float UIMin = 0.0f; float UIMax = 100.0f;
> = { 1.0f };
 //===================================================================================================================//
float BlendOpacity	/* Controls opacity for certain blend modes */
	<	
		string UIName = "Kabloom blending: blend opacity" ; string UIWidget = "Slider" ; float UIMin = 0.0f; float UIMax = 100.0f;
> = { 1.0f };
 //===================================================================================================================//
	
/*
 =======================================================================================================================
    Functions
 =======================================================================================================================
 */
 
 /*
 =======================================================================================================================
	Takes a 3 component vector input and alters it so that the sum of its components will equal the specified sum value
	//thanks prod80
 =======================================================================================================================
 */
float3 sumTo(in float3 weights, in float sumValue)
{
	if(any(weights.rgb))
	{
		return weights.rgb / dot(weights.rgb, 1.0f / sumValue);
	}
	else
	{
		return sumValue.xxx / 3.0f;
	}
}
/*
 ===================================================================================================c====================
	Perceptually-weighted euclidean-distance luma calculation 	//thanks Darel Rex Finley
 =======================================================================================================================
 */
float pLuma(in float3 color)
{							
	return sqrt(dot(pow(color.rgb, 2.0f), float3(0.299f, 0.587f, 0.114f)));
}
/*
 =======================================================================================================================
    Configurable luma calculation with perceptual weighting enforced for a vector of (0, 0, 0)
 =======================================================================================================================
 */
float cLuma(in float3 color, in float3 lumaWeights)
{
	if(any(lumaWeights.rgb))
	{
		lumaWeights.rgb = sumTo(lumaWeights.rgb, 1.0f);
	}
	else
	{
		lumaWeights.rgb = float3(0.299f, 0.587f, 0.114f);
	}
	return sqrt(dot(pow(color.rgb, 2.0f), lumaWeights.rgb));
}
/*
 =======================================================================================================================
	Saturation shader that maintains color ratios (thanks prod80) //TODO: Test saturation above 2.0
 =======================================================================================================================
 */
float3 adjustSaturation(in float3 color, in float saturation)
{
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	float grey = dot( color.rgb, float3(0.3333f, 0.3333f, 0.3333f));
	float3 desat = lerp(grey, color.rgb, saturation);
	float cmin = min(min(color.r, color.g), color.b);
	float cmax = max(max(color.r, color.g), color.b);
	float csaturation = cmax - cmin;
	float vibrance = saturation - 1.0f;
	float3 sat = lerp(grey, color.rgb, (1.0f + (vibrance * (1.0f - (sign(vibrance) * csaturation)))));
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	if(saturation < 1.0f)
	{
		color.rgb = desat.rgb;
	}
	else
	{
		color.rgb = sat.rgb;
	}
	return color.rgb;
}
/*
 =======================================================================================================================
	Simple contrast adjustment	//TODO: Try basic add/subtract/multiply version
 =======================================================================================================================
 */
float3 adjustContrast(in float3 color, in float contrast)
{
	color.rgb = max
			(
				0.0f,
				pow(color.rgb, max(0.0f, BloomContrast.xxx)) /
					(
						pow(saturate(color.rgb), max(0.0f, BloomContrast.xxx)) + pow
							(
								1.0f - saturate(color.rgb),
								max(0.0f, contrast.xxx)
							)
					)
			);
	return color.rgb;
}
/*
 =======================================================================================================================
	Photoshop-style levels adjustment with gamma control //thanks prod80
 =======================================================================================================================
 */
float3 levelsAdjust
(
	in float3 color,
	in float inBlack,
	in float inGamma,
	in float inWhite,
	in float outBlack,
	in float outWhite
)
{
	color = saturate(color.rgb);
	color.rgb = pow(max(color.rgb - inBlack, 0.0f) 
				/ max(inWhite - inBlack, 0.0001f), inGamma) 
				* max(outWhite - outBlack, 0.0001f) + outBlack;
	return color.rgb;
}
/*
 =======================================================================================================================
	Main effect code	//TODO: Add and get rid of some blend modes, feedback? :)
 =======================================================================================================================
 */
float3 kaBloom
(
	in sampler2D _s3,
	in float4 _v0,
	in float3 color,
	in float InBlack,
	in float InWhite,
	in float InGamma,
	in float OutBlack,
	in float OutWhite,
	in float BloomBrightness,
	in float BloomContrast,
	in float BloomSaturation,
	in float BloomSensitivity,
	in float BloomIntensity,
	in float3 RGBBalance,
	in float3 RGBWeights,
	in int BlendMode,
	in float BlendAmount,
	in float BlendOpacity
)
{
	if(BlendMode)
	{
		/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
		/* Load bloom texture */
		float4 kabloom = tex2D(_s3, _v0.xy);
		/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
		/* Levels// */
		kabloom.rgb = levelsAdjust(kabloom.rgb, InBlack, InGamma, InWhite, OutBlack, OutWhite);
		/* Color Balance// */
		kabloom.rgb *= sumTo(RGBBalance.rgb, 3);
		/* Input intensity// */
		kabloom.rgb *= pow(2.0f, BloomBrightness);
		/* Contrast// */
		kabloom.rgb = adjustContrast(kabloom.rgb, BloomContrast);
		/* Saturation// */
		kabloom.rgb = adjustSaturation(kabloom.rgb, BloomSaturation);
		/* Sensitivity for haze reduction// */
		kabloom.rgb = max
			(
				0.0f,
				pow
				(
					kabloom.rgb,
					max(0.0f, (1.0f / max(0.0001f, (BloomSensitivity * cLuma(kabloom.rgb, RGBWeights.rgb)))))
				)
			);
		/* Output intensity// */
		kabloom.rgb *= pow(2.0f, BloomIntensity);
		/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
		float tempLuma = cLuma(kabloom.rgb, RGBWeights.rgb);
		/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
		/* Blend modes// */
		if(BlendMode == 2)		/* Opacity */
		{
			color.rgb = lerp(color.rgb, kabloom.rgb * BlendAmount, BlendOpacity);
		}
		else if(BlendMode == 3) /* Lighten */
		{
			color.rgb = max(color.rgb, kabloom * BlendAmount);
		}
		else if(BlendMode == 4) /* Lighten/opacity */
		{
			color.rgb = max(color.rgb, lerp(color.rgb, kabloom.rgb * BlendAmount, BlendOpacity));
		}
		else if(BlendMode == 5) /* Brightness-dependent */
		{
			color.rgb = lerp(color.rgb, kabloom.rgb, saturate(pow(tempLuma, 1.0f / tempLuma) * BlendAmount));
		}
		else if(BlendMode == 6) /* Screen add */	//thanks prod80
		{
			color.rgb += 1.0f - (1.0f - saturate(kabloom.rgb)) * (1.0f - saturate(kabloom.rgb * BlendAmount));
		}
		else if(BlendMode == 7) /* Screen/opacity */
		{
			color.rgb = max
				(
					0.0f,
					lerp
					(
						color.rgb,
						(1.0f - (1.0f - saturate(kabloom.rgb)) * (1.0f - saturate(kabloom.rgb * BlendAmount))),
						BlendOpacity
					)
				);
		}
		else if(BlendMode == 8) /* Screen/lighten/opacity */ 
		{
			color.rgb = max
				(
					0.0f,
					max
					(
						color.rgb,
						lerp
							(
								color.rgb,
								(
									1.0f - (1.0f - saturate(kabloom.rgb)) *
										(1.0f - saturate(kabloom.rgb * BlendAmount))
								),
								BlendOpacity
							)
					)
				);
		}
		else	/* Addition */
		{
			color.rgb += kabloom.rgb * BlendAmount;
		}
	}
	return color.rgb;
}