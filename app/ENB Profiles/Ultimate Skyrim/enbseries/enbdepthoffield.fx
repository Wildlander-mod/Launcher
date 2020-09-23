//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ENBSeries Skyrim SE dx9 sm3 effect file
// visit facebook.com/MartyMcModding for news/updates
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Advanced Depth of Field 3.0.1DX9
// Copyright (c) 2008-2018 Marty McFly / Pascal Gilcher
// CC BY-NC-ND 3.0 licensed.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/*******************************************************************
//Non-UI vars. Some could be made changeable in realtime, at the cost
//of performance.
//Use APPLY EFFECTS in enbseries.ini window if changes do not apply.
*******************************************************************/

//------------------------------------------------------------------
//Enables partial occlusion of bokeh disc at screen corners
#define ADOF_OPTICAL_VIGNETTE_ENABLE	           0	  //[0 or 1]
//------------------------------------------------------------------
//Enables chromatic aberration at bokeh shape borders.
#define ADOF_CHROMATIC_ABERRATION_ENABLE           1	  //[0 or 1]

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//UI vars, nothing to edit for standard users below this point
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

bool    bADOF_AutofocusEnable 		< string UIName="DOF: Enable Autofocus";															> = {true};
float2	fADOF_AutofocusCenter 		< string UIName="DOF: Autofocus sample center"; 	string UIWidget="Spinner"; 	float UIStep=0.01; 	float UIMin=0.00; 	float UIMax=1.00;	> = {0.5,0.5};
float	fADOF_AutofocusRadius		< string UIName="DOF: Autofocus sample radius";		string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=0.01;	float UIMax=1.00;	> = {0.05};
float	fADOF_ManualfocusDepth		< string UIName="DOF: Manual focus depth";		string UIWidget="Spinner";	float UIStep=0.001;	float UIMin=0.00;	float UIMax=1.0;	> = {0.05};
float	fADOF_NearBlurCurve		< string UIName="DOF: Near blur curve";			string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=0.01;	float UIMax=20.0;	> = {1.0};
float	fADOF_FarBlurCurve		< string UIName="DOF: Far blur curve";			string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=0.01;	float UIMax=20.0;	> = {1.4};
float	fADOF_HyperFocus		< string UIName="DOF: Hyperfocal depth distance";	string UIWidget="Spinner";	float UIStep=0.001;	float UIMin=0.00;	float UIMax=1.0;	> = {0.015};
float	fADOF_RenderResolutionMult	< string UIName="DOF: Blur render res mult";		string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=0.50;	float UIMax=1.0;	> = {0.5};
float	fADOF_BokehIntensity		< string UIName="DOF: Bokeh Intensity";			string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=0.0;	float UIMax=1.0;	> = {0.5};
float	fADOF_ShapeRadius		< string UIName="DOF: Bokeh shape max size";		string UIWidget="Spinner";	float UIStep=0.1;	float UIMin=0.0;	float UIMax=100.0;	> = {15.0};
int	iADOF_ShapeVertices		< string UIName="DOF: Bokeh shape vertices";		string UIWidget="spinner";				int UIMin=3;		int UIMax=9;		> = {6};
int	iADOF_ShapeQuality		< string UIName="DOF: Bokeh shape quality";		string UIWidget="spinner";				int UIMin=2;		int UIMax=25;		> = {5};
float	fADOF_ShapeCurvatureAmount	< string UIName="DOF: Bokeh shape roundness";		string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=-1.0;	float UIMax=1.0;	> = {1.0};
float	fADOF_ShapeRotation		< string UIName="DOF: Bokeh shape rotation (\xB0)";	string UIWidget="Spinner";	float UIStep=1;		float UIMin=0;		float UIMax=360;	> = {15};
float	fADOF_ShapeAnamorphRatio	< string UIName="DOF: Bokeh shape aspect ratio";	string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=0.0;	float UIMax=1.0;	> = {1.0};
float	fADOF_SmootheningAmount		< string UIName="DOF: Gaussian postblur width";		string UIWidget="Spinner";	float UIStep=1.0;	float UIMin=0.0;	float UIMax=20.0;	> = {4.0};
#if (ADOF_OPTICAL_VIGNETTE_ENABLE != 0)
 float	fADOF_ShapeVignetteCurve	< string UIName="DOF: Bokeh shape vignette curve";	string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=0.5;	float UIMax=2.5;	> = {0.75};
 float	fADOF_ShapeVignetteAmount	< string UIName="DOF: Bokeh shape vignette amount";	string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=0.0;	float UIMax=2.0;	> = {1.0};
#endif
#if (ADOF_CHROMATIC_ABERRATION_ENABLE != 0)
 float	fADOF_ShapeChromaAmount		< string UIName="DOF: Shape chromatic aberration amount";string UIWidget="Spinner";	float UIStep=0.01;	float UIMin=-1.00;	float UIMax=1.00;	> = {-1.0};
 int	iADOF_ShapeChromaMode		< string UIName="DOF: Shape chromatic aberration type";	string UIWidget="spinner";				int UIMin=0;		int UIMax=2;		> = {2};
#endif

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//external enb parameters, do not modify
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

float4	tempF1; 		//0,1,2,3
float4  tempF2;                 //5,6,7,8
float4	tempF3; 		//9,0
float4	Timer; 			//x = generic timer in range 0..1, period of 16777216 ms (4.6 hours), y = average fps, w = frame time elapsed (in seconds)
float4	ScreenSize; 		//x = Width, y = 1/Width, z = aspect, w = 1/aspect, aspect is Width/Height
float	ENightDayFactor;	//changes in range 0..1, 0 means that night time, 1 - day time
float	EInteriorFactor;	//changes 0 or 1. 0 means that exterior, 1 - interior
float	FieldOfView;            //fov in degrees
float	FadeFactor;             //adaptation delta time for focusing
float	EnableDepthOfField;     //1.0 if enabled, 0.0 if disabled

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Semi-hardcoded parameters, DO NOT MODIFY unless you know what you do.
//But what am I saying, you're gonna do it anyways.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

#define DISCRADIUS_RESOLUTION_BOUNDARY_LOWER 	0.25//1.0	//used for blending blurred scene.
#define DISCRADIUS_RESOLUTION_BOUNDARY_UPPER 	1.0//6.0	//used for blending blurred scene.
#define DISCRADIUS_RESOLUTION_BOUNDARY_CURVE    0.5		//used for blending blurred scene.
#define FPS_HAND_BLUR_CUTOFF_DIST		0.3353		//fps hand depth (x10.000), change if you perceive blurred fps weapons.
#define FPS_HAND_BLUR_CUTOFF_CHECK		0		//blur = max if depth > hand depth, else 0, useful for tweaking above param
#define GAUSSIAN_BUILDUP_MULT			4.0		//value of x -> gaussian reaches max radius at |CoC| == 1/x

static const float2 PixelSize 			= float2(ScreenSize.y,ScreenSize.y*ScreenSize.z);
static const float2 ViewPortSize 		= float2(ScreenSize.x,ScreenSize.x*ScreenSize.w);

#define linearstep(a,b,x) saturate((x-a)/(b-a))
#define LinearizeDepth(x) x *= rcp(-2999.0 * x + 3000.0)

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//mod parameters, do not modify
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

texture2D texOriginal;  //backbuffer, before any changes made by this file
texture2D texMask;      //alpha channel is mask for skinned objects (less than 1) and amount of sss
texture2D texColor;     //backbuffer, output of previous pass
texture2D texDepth;     //scene depth
texture2D texNoise;     //256x256 random white noise
texture2D texPalette;   //enbpalette.bmp
texture2D texFocus;     //computed focusing depth
texture2D texCurr;      //4*4 texture for focusing
texture2D texPrev;      //4*4 texture for focusing

sampler2D SamplerOriginal = sampler_state
{
	Texture   = <texOriginal>;
	MinFilter = POINT;
	MagFilter = POINT;
	MipFilter = NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D SamplerMask = sampler_state
{
	Texture   = <texMask>;
	MinFilter = POINT;
	MagFilter = POINT;
	MipFilter = NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D SamplerColor = sampler_state
{
	Texture   = <texColor>;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
	MipFilter = NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D SamplerDepth = sampler_state
{
	Texture   = <texDepth>;
	MinFilter = POINT;
	MagFilter = POINT;
	MipFilter = NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D SamplerNoise = sampler_state
{
	Texture   = <texNoise>;
	MinFilter = POINT;
	MagFilter = POINT;
	MipFilter = NONE;
	AddressU  = Wrap;
	AddressV  = Wrap;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D SamplerPalette = sampler_state
{
	Texture   = <texPalette>;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
	MipFilter = NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D SamplerCurr = sampler_state
{
	Texture   = <texCurr>;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
	MipFilter = LINEAR;//NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D SamplerPrev = sampler_state
{
	Texture   = <texPrev>;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
	MipFilter = NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

sampler2D SamplerFocus = sampler_state
{
	Texture   = <texFocus>;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
	MipFilter = NONE;
	AddressU  = Clamp;
	AddressV  = Clamp;
	SRGBTexture=FALSE;
	MaxMipLevel=0;
	MipMapLodBias=0;
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Vertex Shader
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

struct VS_OUTPUT_DOF
{
	float4 vpos  : POSITION;
	float4 txcoord : TEXCOORD0;
        float4 offset0 : TEXCOORD1;
        float2x2 offsmat : TEXCOORD2;
};

struct VS_OUTPUT_POST
{
	float4 vpos  : POSITION;
	float2 txcoord : TEXCOORD0;
};

struct VS_INPUT_POST
{
	float3 pos  : POSITION;
	float2 txcoord : TEXCOORD0;
};

VS_OUTPUT_DOF VS_DoF(VS_INPUT_POST IN, uniform float scale)
{
        VS_OUTPUT_DOF OUT;
        OUT.vpos    = float4(IN.pos,1.0);
        OUT.txcoord.xy = IN.txcoord.xy;
        OUT.txcoord.zw = IN.txcoord.xy / scale;

        //can't precompute vertices directly, not enough registers in sm3
        sincos(radians(fADOF_ShapeRotation), OUT.offset0.x, OUT.offset0.y);
        sincos(6.2831853 / iADOF_ShapeVertices, OUT.offsmat._21, OUT.offsmat._22);
        OUT.offsmat._11 = OUT.offsmat._22;
        OUT.offsmat._12 = -OUT.offsmat._21;

        OUT.offset0.zw = mul(OUT.offset0.xy, OUT.offsmat);

        return OUT;
}

VS_OUTPUT_POST VS_Quad(VS_INPUT_POST IN)
{
        VS_OUTPUT_POST OUT;
        OUT.vpos    = float4(IN.pos,1.0);
        OUT.txcoord = IN.txcoord;
        return OUT;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Functions
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

float GetLinearDepth(float2 texcoord)
{
	float depth = tex2Dlod(SamplerDepth, texcoord.xyxy).x;
	LinearizeDepth(depth);
	return depth;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

float CircleOfConfusion(float2 texcoord, bool aggressiveLeakReduction)
{
	float2 depthdata; //x - linear scene depth, y - linear scene focus
	float scenecoc;   //blur value, signed by position relative to focus plane

        depthdata.x = GetLinearDepth(texcoord.xy);

	[branch]
	if(aggressiveLeakReduction)
	{
                float3 neighbourOffsets = float3(PixelSize.xy, 0);
                float4 neighbourDepths = float4(tex2D(SamplerDepth, texcoord.xy - neighbourOffsets.xz).x, //left
                                                tex2D(SamplerDepth, texcoord.xy + neighbourOffsets.xz).x, //right
                                                tex2D(SamplerDepth, texcoord.xy - neighbourOffsets.zy).x, //top
                                                tex2D(SamplerDepth, texcoord.xy + neighbourOffsets.zy).x);//bottom

		LinearizeDepth(neighbourDepths);

		float neighbourMin = min(min(neighbourDepths.x,neighbourDepths.y),min(neighbourDepths.z,neighbourDepths.w));
		depthdata.x = lerp(min(neighbourMin, depthdata.x), depthdata.x, 0.001);
	}

	depthdata.y = tex2D(SamplerFocus, texcoord.xy).x;
	float handdepth = depthdata.x;

	depthdata.xy = saturate(depthdata.xy / fADOF_HyperFocus);

	[branch]
	if(depthdata.x < depthdata.y)
	{
		scenecoc = depthdata.x / depthdata.y - 1.0;
		scenecoc = ldexp(scenecoc, -0.5*fADOF_NearBlurCurve*fADOF_NearBlurCurve);
	}
	else
	{
		scenecoc = (depthdata.x - depthdata.y)/(ldexp(depthdata.y, fADOF_FarBlurCurve*fADOF_FarBlurCurve) - depthdata.y);
	        scenecoc = saturate(scenecoc);
	}

#if(FPS_HAND_BLUR_CUTOFF_CHECK != 0)
	scenecoc = (handdepth < FPS_HAND_BLUR_CUTOFF_DIST * 1e-4) ? 0.0 : 1.0;
#else //FPS_HAND_BLUR_CUTOFF_CHECK
	scenecoc = (handdepth < FPS_HAND_BLUR_CUTOFF_DIST * 1e-4) ? 0.0 : scenecoc;
#endif //FPS_HAND_BLUR_CUTOFF_CHECK

	return scenecoc;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Pixel Shaders
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//fullres -> 4x4
float4	PS_ReadFocus(VS_OUTPUT_POST IN) : COLOR
{
	float scenefocus = 0.0;

        [branch]
	if(bADOF_AutofocusEnable == true)
	{
		float samples = 10.0;
		float weightsum = 1e-6;

		for(float xcoord = 0.0; xcoord < samples; xcoord++)
		for(float ycoord = 0.0; ycoord < samples; ycoord++)
		{
			float2 sampleOffset = (float2(xcoord,ycoord) + 0.5) / samples;
			sampleOffset = sampleOffset * 2.0 - 1.0;
			sampleOffset *= fADOF_AutofocusRadius;
			sampleOffset += (fADOF_AutofocusCenter - 0.5);

			float sampleWeight = saturate(1.2 * exp2(-dot(sampleOffset,sampleOffset)*4.0));

			float tempfocus = GetLinearDepth(sampleOffset * 0.5 + 0.5);
			sampleWeight *= rcp(tempfocus + 0.001);

			sampleWeight *= saturate(tempfocus > FPS_HAND_BLUR_CUTOFF_DIST * 1e-4); //remove fps hands from focus calculations

			scenefocus += tempfocus * sampleWeight;
			weightsum += sampleWeight;
		}
		scenefocus /= weightsum;
	}
	else
	{
		scenefocus = fADOF_ManualfocusDepth;
	}

	return scenefocus;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//4x4 -> 1x1
float4	PS_WriteFocus(VS_OUTPUT_POST IN) : COLOR
{
        float prevFocus         = 0;
	float currFocus         = 0;
        float4 sampleCoord      = 0;

	for(int i = 0; i < 4; i++)
        {
	        for(int j = 0; j < 4; j++)
	        {
                        prevFocus += tex2Dlod(SamplerPrev, sampleCoord).x;
                        currFocus += tex2Dlod(SamplerCurr, sampleCoord).x;
                        sampleCoord.y += 0.25;
                }
                sampleCoord.y = 0;
                sampleCoord.x += 0.25;
	}

	return (bADOF_AutofocusEnable == true) ? lerp(prevFocus,currFocus,FadeFactor) * 0.0625 : currFocus * 0.0625;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

float4	PS_CoC(VS_OUTPUT_POST IN) : COLOR
{
	float4 color = tex2D(SamplerColor, IN.txcoord.xy);

	static const float2 sampleOffsets[4] = {float2( 1.5, 0.5) * PixelSize.xy,
		                                float2( 0.5,-1.5) * PixelSize.xy,
				                float2(-1.5,-0.5) * PixelSize.xy,
				                float2(-0.5, 1.5) * PixelSize.xy};

	float4 compColor = 0.0;
	float centerDepth = GetLinearDepth(IN.txcoord.xy);
        float4 sampleCoord = 0.0;
        float3 neighbourOffsets = float3(PixelSize.xy, 0);

	[loop]
	for(int i=0; i<4; i++)
	{
		sampleCoord.xy = IN.txcoord.xy + sampleOffsets[i];

		float3 sampleColor = tex2Dlod(SamplerColor,  sampleCoord).rgb;

                float4 sampleDepths = float4(tex2Dlod(SamplerDepth, sampleCoord + neighbourOffsets.xzzz).x,  //right
                                             tex2Dlod(SamplerDepth, sampleCoord - neighbourOffsets.xzzz).x,  //left
                                             tex2Dlod(SamplerDepth, sampleCoord + neighbourOffsets.zyzz).x,  //bottom
                                             tex2Dlod(SamplerDepth, sampleCoord - neighbourOffsets.zyzz).x); //top

                float sampleDepthMin = min(min(sampleDepths.x,sampleDepths.y),min(sampleDepths.z,sampleDepths.w));
                LinearizeDepth(sampleDepthMin);

		sampleColor /= 1.0 + max(max(sampleColor.r, sampleColor.g), sampleColor.b);

		float sampleWeight = saturate(sampleDepthMin * rcp(centerDepth) + 1e-3);
		compColor += float4(sampleColor.rgb * sampleWeight, sampleWeight);
	}

	compColor.rgb /= compColor.a;
	compColor.rgb /= 1.0 - max(compColor.r, max(compColor.g, compColor.b));

	color.rgb = lerp(color.rgb, compColor.rgb, saturate(compColor.w * 8.0));
	color.w = CircleOfConfusion(IN.txcoord.xy, 1);

	return color;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

void ShapeRoundness(inout float2 sampleOffset, in float roundness)
{
	sampleOffset *= (1.0-roundness) + rsqrt(dot(sampleOffset,sampleOffset))*roundness;
}

void OpticalVignette(in float2 sampleOffset, in float2 centerVec, inout float sampleWeight)
{
	sampleOffset -= centerVec; //scaled by vignette intensity
	sampleWeight *= saturate(3.333 - dot(sampleOffset,sampleOffset) * 1.666); //notsosmoothstep to avoid aliasing
}

float2 CoC2BlurRadius(float CoC)
{
	return float2(fADOF_ShapeAnamorphRatio,ScreenSize.z) * CoC * fADOF_ShapeRadius * 6e-4;
}

float4	PS_DoF_Main(VS_OUTPUT_DOF IN) : COLOR
{
	clip(1.01-max(IN.txcoord.z,IN.txcoord.w));

	float4 BokehSum, BokehMax;
	BokehMax = BokehSum		= tex2D(SamplerColor, IN.txcoord.zw);
	float weightSum 		= 1.0;
	float CoC 			= abs(BokehSum.w);
	float2 bokehRadiusScaled	= CoC2BlurRadius(CoC);
	float nRings 			= lerp(1.0,iADOF_ShapeQuality,saturate(CoC)) + frac(dot(IN.txcoord.xy, ViewPortSize) * 0.5) * 0.5;

	if(bokehRadiusScaled.x < DISCRADIUS_RESOLUTION_BOUNDARY_LOWER * ScreenSize.y) return BokehSum;

	bokehRadiusScaled /= nRings;
	CoC /= nRings;

#if (ADOF_OPTICAL_VIGNETTE_ENABLE != 0)
	float2 centerVec = IN.txcoord.zw - 0.5;
	float centerDist = sqrt(dot(centerVec,centerVec));
	float vignette = pow(centerDist, fADOF_ShapeVignetteCurve) * fADOF_ShapeVignetteAmount;
	centerVec = centerVec / centerDist * vignette;
	weightSum *= saturate(3.33 - vignette * 2.0);
	BokehSum *= weightSum;
	BokehMax *= weightSum;
#endif
	[fastopt]
        for (int iVertices = 0; iVertices < iADOF_ShapeVertices; iVertices++)
        {
	        [fastopt]
                for(float iRings = 1; iRings <= nRings; iRings++)
                {
                        [fastopt]
                        for(float iSamplesPerRing = 0; iSamplesPerRing < iRings; iSamplesPerRing++)
	                {
		              float2 sampleOffset = lerp(IN.offset0.xy,IN.offset0.zw,iSamplesPerRing/iRings);
		              ShapeRoundness(sampleOffset,fADOF_ShapeCurvatureAmount);

		              float4 sampleBokeh 	= tex2Dlod(SamplerColor, float4(IN.txcoord.zw + sampleOffset.xy * (bokehRadiusScaled * iRings),0,0));
		              float sampleWeight	= saturate(1e6 * (abs(sampleBokeh.a) - CoC * (float)iRings) + 1.0);

#if (ADOF_OPTICAL_VIGNETTE_ENABLE != 0)
		              OpticalVignette(sampleOffset.xy * iRings/nRings, centerVec, sampleWeight);
#endif
		              sampleBokeh.rgb 	*= sampleWeight;
		              weightSum 	+= sampleWeight;
		              BokehSum 		+= sampleBokeh;
		              BokehMax 		= max(BokehMax,sampleBokeh);
	               }
               }

               IN.offset0.xy = IN.offset0.zw;
               IN.offset0.zw = mul(IN.offset0.zw, IN.offsmat);
       }

       return lerp(BokehSum / weightSum, BokehMax, fADOF_BokehIntensity);
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

float4	PS_DoF_Combine(VS_OUTPUT_POST IN) : COLOR
{

	float4 blurredColor = tex2D(SamplerColor, IN.txcoord.xy * fADOF_RenderResolutionMult);
	float4 originalColor  = tex2D(SamplerOriginal, IN.txcoord.xy);

	float CoC 		= CircleOfConfusion(IN.txcoord.xy, 0);
	float CoCblurred	= blurredColor.a;

	float bokehRadiusPixels = abs(CoC2BlurRadius(CoC).x * ScreenSize.x);

	float blendWeight = linearstep(DISCRADIUS_RESOLUTION_BOUNDARY_LOWER, DISCRADIUS_RESOLUTION_BOUNDARY_UPPER, bokehRadiusPixels);
	      blendWeight = pow(blendWeight,DISCRADIUS_RESOLUTION_BOUNDARY_CURVE);

	float4 outColor;
	outColor.rgb    = lerp(originalColor.rgb, blurredColor.rgb, blendWeight);
	outColor.a      = saturate(abs(lerp(CoC, CoCblurred, blendWeight)) * GAUSSIAN_BUILDUP_MULT);

	return outColor;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

float4	PS_DoF_Gauss(uniform float2 axis, uniform bool overrideAlpha, VS_OUTPUT_POST IN) : COLOR
{
	float4 centerTap = tex2D(SamplerColor, IN.txcoord.xy);

	float nSteps 		= centerTap.a * (fADOF_SmootheningAmount + 3.0);
	float expCoeff 		= -2.0 * rcp(nSteps * nSteps + 1e-3); //sigma adjusted for blur width, needs non-integer stepped value to avoid visible kernel quality jumps
	float2 blurAxisScaled 	= axis * PixelSize.xy;

	float4 gaussianSum = 0.0;
	float  gaussianSumWeight = 1e-3;
	nSteps = floor(nSteps);

	for(float iStep = -nSteps; iStep <= nSteps; iStep++)
	{
		float currentWeight = exp(iStep * iStep * expCoeff);
		float currentOffset = 2.0 * iStep - 0.5; //Sample between texels to double blur width at no cost

		float4 currentTap = tex2Dlod(SamplerColor, float4(IN.txcoord.xy + blurAxisScaled.xy * currentOffset, 0, 0));
		currentWeight *= saturate(currentTap.a - centerTap.a * 0.25); //bleed fix

		gaussianSum += currentTap * currentWeight;
		gaussianSumWeight += currentWeight;
	}

	gaussianSum /= gaussianSumWeight;

	float4 outColor = lerp(centerTap, gaussianSum, saturate(gaussianSumWeight));
#if (ADOF_CHROMATIC_ABERRATION_ENABLE != 0)
	if(overrideAlpha == true) outColor.a = CircleOfConfusion(IN.txcoord.xy, 0);
#else
        if(overrideAlpha == true) outColor.a = 1;    //fix potential bugs in enbeffect due to wrong code
#endif
	return outColor;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

#if (ADOF_CHROMATIC_ABERRATION_ENABLE != 0)
float4	PS_DoF_ChromaticAberration(VS_OUTPUT_POST IN, float4 vPos : POSITION) : COLOR
{
	float4 colorVals[5];
/*
	colorVals[0] = TextureColor.Load(int3(vPos.x, vPos.y, 0));
	colorVals[1] = TextureColor.Load(int3(vPos.x - 1, vPos.y, 0)); //L
	colorVals[2] = TextureColor.Load(int3(vPos.x, vPos.y - 1, 0)); //T
	colorVals[3] = TextureColor.Load(int3(vPos.x + 1, vPos.y, 0)); //R
	colorVals[4] = TextureColor.Load(int3(vPos.x, vPos.y + 1, 0)); //B
*/
        float3 neighbourOffsets = float3(PixelSize.xy, 0);

        colorVals[0] = tex2D(SamplerColor, IN.txcoord.xy);                       //C
        colorVals[1] = tex2D(SamplerColor, IN.txcoord.xy - neighbourOffsets.xz); //L
        colorVals[2] = tex2D(SamplerColor, IN.txcoord.xy - neighbourOffsets.zy); //T
        colorVals[3] = tex2D(SamplerColor, IN.txcoord.xy + neighbourOffsets.xz); //R
        colorVals[4] = tex2D(SamplerColor, IN.txcoord.xy + neighbourOffsets.zy); //B

	float CoC 			= abs(colorVals[0].a);
	float2 bokehRadiusScaled	= CoC2BlurRadius(CoC);

	float4 vGradTwosided = float4(dot(colorVals[0].rgb - colorVals[1].rgb, 1),	 //C - L
	                              dot(colorVals[0].rgb - colorVals[2].rgb, 1),	 //C - T
				      dot(colorVals[3].rgb - colorVals[0].rgb, 1),	 //R - C
				      dot(colorVals[4].rgb - colorVals[0].rgb, 1)); 	 //B - C

	float2 vGrad = min(vGradTwosided.xy, vGradTwosided.zw);

	float vGradLen = sqrt(dot(vGrad,vGrad)) + 1e-6;
	vGrad = vGrad / vGradLen * saturate(vGradLen * 32.0) * bokehRadiusScaled * 0.125 * fADOF_ShapeChromaAmount;

	float4 chromaVals[3];

	chromaVals[0] = colorVals[0];
	chromaVals[1] = tex2D(SamplerColor, IN.txcoord.xy + vGrad);
	chromaVals[2] = tex2D(SamplerColor, IN.txcoord.xy - vGrad);

	chromaVals[1].rgb = lerp(chromaVals[0].rgb, chromaVals[1].rgb, saturate(4.0 * abs(chromaVals[1].w)));
	chromaVals[2].rgb = lerp(chromaVals[0].rgb, chromaVals[2].rgb, saturate(4.0 * abs(chromaVals[2].w)));

	int3 chromaMode = (int3(0,1,2) + iADOF_ShapeChromaMode.xxx) % 3;

	float4 BokehSum;
	BokehSum.rgb = float3(chromaVals[chromaMode.x].r,
		              chromaVals[chromaMode.y].g,
			      chromaVals[chromaMode.z].b);
	BokehSum.a = 1.0;

	return BokehSum;
}
#endif

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Techniques
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//I just HATE messy technique sections..

#define TECH9(NAME, VERTEXSHADER, PIXELSHADER)\
technique NAME { pass p0 { VertexShader = compile vs_3_0 VERTEXSHADER; PixelShader  = compile ps_3_0 PIXELSHADER; }}

TECH9(ReadFocus, 	VS_Quad(), 				PS_ReadFocus())
TECH9(WriteFocus, 	VS_Quad(), 				PS_WriteFocus())
TECH9(PostProcess, 	VS_Quad(), 				PS_CoC())
TECH9(PostProcess2, 	VS_DoF(fADOF_RenderResolutionMult), 	PS_DoF_Main())
TECH9(PostProcess3, 	VS_Quad(), 				PS_DoF_Combine())
TECH9(PostProcess4, 	VS_Quad(), 				PS_DoF_Gauss(float2(0,1),0))
TECH9(PostProcess5, 	VS_Quad(), 				PS_DoF_Gauss(float2(1,0),1))
#if (ADOF_CHROMATIC_ABERRATION_ENABLE != 0)
TECH9(PostProcess6, 	VS_Quad(), 				PS_DoF_ChromaticAberration())
#endif
