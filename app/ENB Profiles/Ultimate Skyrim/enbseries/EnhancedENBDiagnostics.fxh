#ifndef EINCLUDEDFILE_ENHANCED_ENB_DIAGNOSTICS
#define EINCLUDEDFILE_ENHANCED_ENB_DIAGNOSTICS
///////////////////////////////////////
// EnhancedENBDiagnostics.fxh
// Version 1.0
// 02/10/2014

// scegielski NOTE:
// This file is an adaptation and expansion of the GLSL 
// shader drawtext.frag from the following url:
// http://mew.cx/drawtext/drawtext.html

// The below copyright text is contained in the file 
// so I am including it here.
///////////////////////////////////////

// File: drawtext.frag
// Author: Mike Weiblen 2005-10-05
// Copyright (C) 2005  3Dlabs Inc. Ltd.
// All rights reserved.
// 
// An OpenGL Shading Language fragment shader to render numeric values as
// text, providing visibility into GLSL shaders.
// Inspired by Jeff Boody's printnum shader.
// Requires the verasansmono.png glyph image.
// Designed to run with fixed-function vertex processing, so no GLSL
// vertex shader is required.
//
///////////////////////////////////////////////////////////////////////////
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//     Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
// 
//     Redistributions in binary form must reproduce the above
//     copyright notice, this list of conditions and the following
//     disclaimer in the documentation and/or other materials provided
//     with the distribution.
// 
//     Neither the name of 3Dlabs Inc. Ltd. nor the names of its
//     contributors may be used to endorse or promote products derived
//     from this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

///////////////////////////////////////////////////////////////////////////////
// Existing Functions converted by scegielski
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// ENB Texture use for ascii lookup.   Other images can
// be made with other fonts by using the same structure.
texture2D EED_texGlyph
<
	string ResourceName="EED_verasansmono.bmp";
>;

sampler2D EED_GlyphTexSampler = sampler_state
{
	Texture = <EED_texGlyph>;
	MinFilter = LINEAR;
	MagFilter = LINEAR;
};

///////////////////////////////////////////////////////////////////////////
// Return the texel of an ASCII character's glyph at the given geometry
// texture coordinate.
// scegielski Note: This is almost identical to the GLSL implementation
// except for my note
float4 EED_readGlyphTexture(float2 geomTexCoord, int ascii)
{
	// glyph scaling constants for the verasansmono.png image.
	const float2 glyScale = float2(1.0/16.0, (300.0/384.0)/6.0); //  (.0625, 0.13020833)

	float2 cellTexCoord = frac(geomTexCoord * float2(150, 50));
	if( (ascii < 32) || (ascii > 127) ) ascii = 127;
	float glyNum = float(ascii - 32) * glyScale.x;

	// scegielksi Note: I had to modify the line below to reverse the glyTexOrigin.y
	// to correct the different texture origin of GLSL.
	// Original GLSL line: vec2 glyTexOrigin = vec2( fract(glyNum), glyScale.y * floor(glyNum) );
	float2 glyTexOrigin = float2(frac(glyNum), glyScale.y * (7.0 - floor(glyNum) - 0.35));

	float2 glyTexCoord = cellTexCoord * glyScale + glyTexOrigin;
	return tex2D( EED_GlyphTexSampler, glyTexCoord );
}

///////////////////////////////////////////////////////////////////////////
// Return a single ASCII character from the decimal expansion of a float.
// (change "base" to render as binary, decimal, or hexadecimal)
// scegielski Note: This function is a straight conversion from GLSL to HLSL.
int EED_float2Ascii( float val, int pos )
{
	const float base = 10.;

	if( (pos == 0) && (val < 0.) ) return 45;   // minus sign '-'

	// at which cell position is the radix point?
	int radixPos = 0;
	if( val < 0. ) radixPos++;                  // room for minus sign
	float x = abs(val);
	do {
		x = floor( x / base );
		radixPos++;
	} while( x > 0. );
	if( pos == radixPos ) return 46;            // radix point '.'

	float exp = float(pos - radixPos);
	if( pos < radixPos ) exp++;
	int digit = int( fmod( abs(val) * pow( base, exp ), base ) );
	//if( digit > 9 ) digit += 39;              // for hexadecimal
	return digit + 48;                          // add ascii zero '0'
}

///////////////////////////////////////////////////////////////////////////
// Display data as a decimal ASCII string, analogous to
// printf( "%f", data[cell.y] )
///////////////////////////////////////////////////////////////////////////
int EED_getFloatCharacter( int2 cell, float data, int precision )
{
	if(cell.x >= 0 && cell.x < precision && cell.y == 0)
   		return EED_float2Ascii( data, cell.x );
    	else
		return  32;
}

///////////////////////////////////////////////////////////////////////////
// Utility functions which, when given a cell position, return a single
// ASCII character to be rendered in that cell.
///////////////////////////////////////////////////////////////////////////
int EED_getWordCharacter( int2 cell, float4 data )
{
	if(cell.x >= 0 && cell.x < 4 && cell.y == 0)
		return int(data[cell.x]);
	else
		return 32;
}

///////////////////////////////////////////////////////////////////////////
// Draw 8 ascii chars in two word variables and a float at the specified
// position and cell sizes
// scegielski Note: Use EED_drawFloatText below instead for easier usage.
float4 EED_drawFloatData(float2 geomTexCoord, float4 txt1, float4 txt2, float data, 
float2 txtPos, float2 txtSize, int precision)
{

	int ascii = 32; 
	geomTexCoord *= (1.0 / txtSize);
	int2 cellIndex = geomTexCoord * float2(150, 50);
	cellIndex -= int2(txtPos * float2(150, 50) * (1.0 / txtSize));

	int cellPad = 9;
	if(cellIndex.y == 0){
		if(cellIndex.x >= 0 && cellIndex.x < 4)
			ascii = EED_getWordCharacter(cellIndex, txt1);
		else if(cellIndex.x >= 4 && cellIndex.x < cellPad)
			ascii = EED_getWordCharacter(cellIndex - int2(4, 0), txt2);
		else{
			ascii = EED_getFloatCharacter( cellIndex - int2(cellPad, 0), data, precision);
		}
	}

	return EED_readGlyphTexture(geomTexCoord, ascii );
}

///////////////////////////////////////////////////////////////////////////////
// New Functions by scegielski
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// EED_drawText(1 to 4):
// Draws 4 to 16 ascii chars of text contained in the .xyzw components
// of txt1 and txt2.  See ascii table at end of file for character
// values.   txCoords should be unmodified and set position
// and size using uvPosition and size args.
float3 EED_drawText1(float4 txt1,
float2 txCoords, float2 uvPosition, float size)
{
	txCoords -= uvPosition;
	txCoords *= (1.0 / size);

	int ascii = 32; 
	float2 txtSize = float2(1.0, 1.0);
	float2 txtPos = float2(0.01, 0.02);
	txCoords *= (1.0 / txtSize);
	int2 cellIndex = txCoords * float2(150, 50);
	cellIndex -= int2(txtPos * float2(150, 50) * (1.0 / txtSize));

	if(cellIndex.y == 0){
		if(cellIndex.x >= 0 && cellIndex.x < 4)
			ascii = EED_getWordCharacter(cellIndex, txt1);
	}

	float4 result = EED_readGlyphTexture(txCoords, ascii );
	return result.xyz;
}

float4 EED_drawText(float4 txt1, float4 txt2, float4 txt3, float4 txt4, 
float2 txCoords, float2 uvPosition, float size)
{
	txCoords -= uvPosition;
	txCoords *= (1.0 / size);

	int ascii = 32; 
	float2 txtSize = float2(1.0, 1.0);
	float2 txtPos = float2(0.01, 0.02);
	txCoords *= (1.0 / txtSize);
	int2 cellIndex = txCoords * float2(150, 50);
	cellIndex -= int2(txtPos * float2(150, 50) * (1.0 / txtSize));

	if(cellIndex.y == 0){
		if(cellIndex.x >= 0 && cellIndex.x < 4)
			ascii = EED_getWordCharacter(cellIndex, txt1);
		else if(cellIndex.x >= 4 && cellIndex.x < 8)
			ascii = EED_getWordCharacter(cellIndex - int2(4, 0), txt2);
		else if(cellIndex.x >= 8 && cellIndex.x < 12)
			ascii = EED_getWordCharacter(cellIndex - int2(8, 0), txt3);
		else if(cellIndex.x >= 12 && cellIndex.x < 16)
			ascii = EED_getWordCharacter(cellIndex - int2(12, 0), txt4);
	}

	return EED_readGlyphTexture(txCoords, ascii );
}

///////////////////////////////////////////////////////////////////////////////
// EED_drawFloatText:
// Draws 8 ascii chars of text contained in the .xyzw components
// of txt1 and txt2.   txCoords should be unmodified and set position
// amnd size using uvPosition and size args.   Precision is where the
// drawing cutoff is, not actual precision.
float4 EED_drawFloatText(float4 txt1, float4 txt2, float val, float2 txCoords, 
float2 uvPosition, float size, int precision)
{
	float4 floatText = 0;
	txCoords -= uvPosition;
	txCoords *= (1.0 / size);

	floatText += EED_drawFloatData(
		txCoords.xy, 
		float4(txt1[0], txt1[1], txt1[2], txt1[3]), 
		float4(txt2[0], txt2[1], txt2[2], txt2[3]),
		val, 		// data
		float2(0.01, 0.02),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	return floatText;
}

///////////////////////////////////////////////////////////////////////////////
// EED_drawCRegisterText:
// Draws  one of the _c register variables.
float4 EED_drawCRegisterText(float2 registerCoords, float4 _c, int cNumAscii, int precision)
{
	float4 registerColor = 0;
	registerColor += EED_drawFloatData(
		registerCoords, 
		float4(32, 32, 95, 99), 
		float4(cNumAscii, 46, 120, 58),
		_c.x, 		// data
		float2(0.001, 0.02),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	registerColor += EED_drawFloatData(
		registerCoords, 
		float4(32, 32, 95, 99), 
		float4(cNumAscii, 46, 121, 58),
		_c.y, 		// data
		float2(0.001, 0.04),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	registerColor += EED_drawFloatData(
		registerCoords, 
		float4(32, 32, 95, 99), 
		float4(cNumAscii, 46, 122, 58),
		_c.z, 		// data
		float2(0.001, 0.06),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	registerColor += EED_drawFloatData(
		registerCoords, 
		float4(32, 32, 95, 99), 
		float4(cNumAscii, 46, 119, 58),
		_c.w, 		// data
		float2(0.001, 0.08),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	return registerColor;
}

///////////////////////////////////////////////////////////////////////////////
// EED_drawCRegistersText:
// Draws the external register values.   Can only be used where available
// such as in enbeffect.fx in whiach the variables are defined like this:
//
// //skyrim shader specific externals, do not modify
// float4	_c1 : register(c1);
// float4	_c2 : register(c2);
// float4	_c19 : register(c19);
// float4	_c20 : register(c20);
// float4	_c22 : register(c22);
// 
// Example call from enbeffect.fx:
//
//	color.xyz += EED_drawCRegistersText(_c1, _c2, _c19, _c20, _c22, 
//		IN.txcoord0, float2(0.9, 0.2), 0.9, 5);
//
float4 EED_drawCRegistersText(float4 _c1, float4 _c2, float4 _c3, float4 _c4, float4 _c5, 
float2 registerTxCoords, float2 uvPosition, float size, int precision)
{
	registerTxCoords -= uvPosition;
	registerTxCoords *= (1.0 / size);

	float4 registerColor=0;
	registerColor += EED_drawCRegisterText(registerTxCoords, _c1, 49, precision);
	registerTxCoords.y -= 0.1;
	registerColor += EED_drawCRegisterText(registerTxCoords, _c2, 50, precision);
	registerTxCoords.y -= 0.1;
	registerColor += EED_drawCRegisterText(registerTxCoords, _c3, 51, precision);
	registerTxCoords.y -= 0.1;
	registerColor += EED_drawCRegisterText(registerTxCoords, _c4, 52, precision);
	registerTxCoords.y -= 0.1;
	registerColor += EED_drawCRegisterText(registerTxCoords, _c5, 53, precision);
	return registerColor;
}


float4 EED_drawCRegisterText2(float2 registerCoords, float4 _c, int cNumAscii1, int cNumAscii2, int precision)
{
	float4 registerColor = 0;
	registerColor += EED_drawFloatData(
		registerCoords, 
		float4(32, 95, 99, cNumAscii1), 
		float4(cNumAscii2, 46, 120, 58),
		_c.x, 		// data
		float2(0.001, 0.02),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	registerColor += EED_drawFloatData(
		registerCoords, 
		float4(32, 95, 99, cNumAscii1), 
		float4(cNumAscii2, 46, 121, 58),
		_c.y, 		// data
		float2(0.001, 0.04),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	registerColor += EED_drawFloatData(
		registerCoords, 
		float4(32, 95, 99, cNumAscii1), 
		float4(cNumAscii2, 46, 122, 58),
		_c.z, 		// data
		float2(0.001, 0.06),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	registerColor += EED_drawFloatData(
		registerCoords, 
		float4(32, 95, 99, cNumAscii1), 
		float4(cNumAscii2, 46, 119, 58),
		_c.w, 		// data
		float2(0.001, 0.08),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);
	return registerColor;
}

float4 EED_drawCRegistersText2(float4 _c1, float4 _c2, float4 _c19, float4 _c20, float4 _c22, 
float2 registerTxCoords, float2 uvPosition, float size, int precision)
{
	registerTxCoords -= uvPosition;
	registerTxCoords *= (1.0 / size);

	float4 registerColor=0;
	registerColor += EED_drawCRegisterText(registerTxCoords, _c1, 49, precision);
	registerTxCoords.y -= 0.1;
	registerColor += EED_drawCRegisterText(registerTxCoords, _c2, 50, precision);
	registerTxCoords.y -= 0.1;
	registerColor += EED_drawCRegisterText2(registerTxCoords, _c19, 49, 57, precision);
	registerTxCoords.y -= 0.1;
	registerColor += EED_drawCRegisterText2(registerTxCoords, _c20, 50, 48, precision);
	registerTxCoords.y -= 0.1;
	registerColor += EED_drawCRegisterText2(registerTxCoords, _c22, 50, 50, precision);
	return registerColor;
}

float3 EED_drawSquare( float2 inCoords, float2 start, float2 end, float3 inColor, float3 color)
{
	if (
		inCoords.x > start.x && inCoords.x < end.x &&
		inCoords.y > start.y && inCoords.y < end.y
	){
		return color;
	}
	else
	{
		return inColor;
	}
}

float3 EED_drawCRegistersColors(
	float3 inColor,
	float4 reg1, float4 reg2, float4 reg3, float4 reg4, float4 reg5,
	float2 inCoords, float2 origin,
	float2 size, float2 spacing
){
	float3 outColor = inColor;
	float2 start, end;

	// .xyz header
	outColor += EED_drawText1(
		float4(46, 120, 121, 122), 
		inCoords, 
		float2(origin.x, origin.y - 0.05), 
		1.0
	);
	
	// .w header
	outColor += EED_drawText1(
		float4(46, 119, 32, 32), 
		inCoords, 
		float2(origin.x + spacing.x, origin.y - 0.05), 
		1.0
	);

	start.x = origin.x; end.x = origin.x + size.x;	
	start.y = origin.y; end.y = origin.y + size.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg1.xyz);
	start.y += spacing.y; end.y += spacing.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg2.xyz);
	start.y += spacing.y; end.y += spacing.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg3.xyz);
	start.y += spacing.y; end.y += spacing.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg4.xyz);
	start.y += spacing.y; end.y += spacing.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg5.xyz);


	start.x += spacing.x; end.x += spacing.x;	
	start.y = origin.y; end.y = origin.y + size.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg1.www);
	start.y += spacing.y; end.y += spacing.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg2.www);
	start.y += spacing.y; end.y += spacing.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg3.www);
	start.y += spacing.y; end.y += spacing.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg4.www);
	start.y += spacing.y; end.y += spacing.y;
	outColor = EED_drawSquare(inCoords, start, end, outColor, reg5.www);

	return outColor;
}

///////////////////////////////////////////////////////////////////////////////
// EED_drawColorText
// Draws text for a RGBA color variable.
//
float4 EED_drawColorText(float4 color, float2 colorTxCoords, float2 uvPosition, float size, int precision)
{
	colorTxCoords -= uvPosition;
	colorTxCoords *= (1.0 / size);

	float4 colorText = 0;
	colorText += float4(1.0, 0.0, 0.0, 1.0) * EED_drawFloatData(
		colorTxCoords.xy, 
		float4(32, 32, 32, 32), // 
		float4(32, 32, 82, 58), // R:
		color.r, 		// data
		float2(0.001, 0.02),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);

	colorText += float4(0.0, 1.0, 0.0, 1.0) * EED_drawFloatData(
		colorTxCoords.xy, 
		float4(32, 32, 32, 32), //
		float4(32, 32, 71, 58), // G:
		color.g, 		// data
		float2(0.001, 0.04),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);

	colorText += float4(0.0, 0.0, 1.0, 1.0) * EED_drawFloatData(
		colorTxCoords.xy, 
		float4(32, 32, 32, 32), // 
		float4(32, 32, 66, 58), // B:
		color.b, 		// data
		float2(0.001, 0.06),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);

	colorText += float4(1.0, 1.0, 1.0, 1.0) * EED_drawFloatData(
		colorTxCoords.xy, 
		float4(32, 32, 32, 32), // 
		float4(32, 32, 65, 58), // A:
		color.a, 		// data
		float2(0.001, 0.08),	// text position x, y
		float2(1.0, 1.0),	// text size x, y
		precision
	);

	return colorText;
}

///////////////////////////////////////////////////////////////////////////
// EED_drawTitleText
// Draw Title text by assigning values in arrays using ASCII reference
// table below.
float4 EED_drawTitleText(float2 txCoords, float2 uvPosition, float size)
{
	txCoords -= uvPosition;
	txCoords *= (1.0 / size);

	float4 titleText = EED_drawText(
		float4(69, 110, 104, 97),  	// Enha
		float4(110, 99, 101, 100),  	// nced
		float4(32, 69, 78, 66),  	//  ENB
		float4(32, 32, 32, 32),  	//
		txCoords, 			// Coords
		float2(0.01, 0.02) , 		// uvPosition
		1.0				// size
	);
	titleText += EED_drawText(
		float4(68, 105, 97, 103),  	// Diag
		float4(110, 111, 115, 116),  	// nost
		float4(105, 99, 115, 32),  	// ics
		float4(32, 32, 32, 32),  	//
		txCoords + float2(0.0025, 0.0),  // Coords
		float2(0.1, 0.02) , 		// uvPosition
		1.0				// size
	);
	titleText += EED_drawText(
		float4(66, 121, 58, 32),  	// by:
		float4(115, 99, 101, 103),  	// sceg
		float4(105, 101, 108, 115),  	// iels
		float4(107, 105, 32, 32),  	// ki
		txCoords, 			// Coords
		float2(0.015, 0.045) , 		// uvPosition
		0.65				// size
	);
	titleText += EED_drawText(
		float4(47, 110, 117, 109),  	// /num 
		float4(98, 101, 114, 54),  	// ber6
		float4(32, 32, 32, 32),  	// iels
		float4(32, 32, 32, 32),  	// ki
		txCoords + float2(0.0045, 0.0), // Coords
		float2(0.08, 0.045) , 		// uvPosition


		0.65				// size
	);

	return titleText;
}

///////////////////////////////////////////////////////////////////////////
// ASCII reference table
///////////////////////////////////////////////////////////////////////////
// Char  Dec  Oct  Hex | Char  Dec  Oct  Hex | Char  Dec  Oct  Hex | Char Dec  Oct   Hex
// -------------------------------------------------------------------------------------
// (nul)   0 0000 0x00 | (sp)   32 0040 0x20 | @      64 0100 0x40 | `      96 0140 0x60
// (soh)   1 0001 0x01 | !      33 0041 0x21 | A      65 0101 0x41 | a      97 0141 0x61
// (stx)   2 0002 0x02 | "      34 0042 0x22 | B      66 0102 0x42 | b      98 0142 0x62
// (etx)   3 0003 0x03 | #      35 0043 0x23 | C      67 0103 0x43 | c      99 0143 0x63
// (eot)   4 0004 0x04 | $      36 0044 0x24 | D      68 0104 0x44 | d     100 0144 0x64
// (enq)   5 0005 0x05 | %      37 0045 0x25 | E      69 0105 0x45 | e     101 0145 0x65
// (ack)   6 0006 0x06 | &      38 0046 0x26 | F      70 0106 0x46 | f     102 0146 0x66
// (bel)   7 0007 0x07 | '      39 0047 0x27 | G      71 0107 0x47 | g     103 0147 0x67
// (bs)    8 0010 0x08 | (      40 0050 0x28 | H      72 0110 0x48 | h     104 0150 0x68
// (ht)    9 0011 0x09 | )      41 0051 0x29 | I      73 0111 0x49 | i     105 0151 0x69
// (nl)   10 0012 0x0a | *      42 0052 0x2a | J      74 0112 0x4a | j     106 0152 0x6a
// (vt)   11 0013 0x0b | +      43 0053 0x2b | K      75 0113 0x4b | k     107 0153 0x6b
// (np)   12 0014 0x0c | ,      44 0054 0x2c | L      76 0114 0x4c | l     108 0154 0x6c
// (cr)   13 0015 0x0d | -      45 0055 0x2d | M      77 0115 0x4d | m     109 0155 0x6d
// (so)   14 0016 0x0e | .      46 0056 0x2e | N      78 0116 0x4e | n     110 0156 0x6e
// (si)   15 0017 0x0f | /      47 0057 0x2f | O      79 0117 0x4f | o     111 0157 0x6f
// (dle)  16 0020 0x10 | 0      48 0060 0x30 | P      80 0120 0x50 | p     112 0160 0x70
// (dc1)  17 0021 0x11 | 1      49 0061 0x31 | Q      81 0121 0x51 | q     113 0161 0x71
// (dc2)  18 0022 0x12 | 2      50 0062 0x32 | R      82 0122 0x52 | r     114 0162 0x72
// (dc3)  19 0023 0x13 | 3      51 0063 0x33 | S      83 0123 0x53 | s     115 0163 0x73
// (dc4)  20 0024 0x14 | 4      52 0064 0x34 | T      84 0124 0x54 | t     116 0164 0x74
// (nak)  21 0025 0x15 | 5      53 0065 0x35 | U      85 0125 0x55 | u     117 0165 0x75
// (syn)  22 0026 0x16 | 6      54 0066 0x36 | V      86 0126 0x56 | v     118 0166 0x76
// (etb)  23 0027 0x17 | 7      55 0067 0x37 | W      87 0127 0x57 | w     119 0167 0x77
// (can)  24 0030 0x18 | 8      56 0070 0x38 | X      88 0130 0x58 | x     120 0170 0x78
// (em)   25 0031 0x19 | 9      57 0071 0x39 | Y      89 0131 0x59 | y     121 0171 0x79
// (sub)  26 0032 0x1a | :      58 0072 0x3a | Z      90 0132 0x5a | z     122 0172 0x7a
// (esc)  27 0033 0x1b | ;      59 0073 0x3b | [      91 0133 0x5b | {     123 0173 0x7b
// (fs)   28 0034 0x1c | <      60 0074 0x3c | \      92 0134 0x5c | |     124 0174 0x7c
// (gs)   29 0035 0x1d | =      61 0075 0x3d | ]      93 0135 0x5d | }     125 0175 0x7d
// (rs)   30 0036 0x1e | >      62 0076 0x3e | ^      94 0136 0x5e | ~     126 0176 0x7e
// (us)   31 0037 0x1f | ?      63 0077 0x3f | _      95 0137 0x5f | (del) 127 0177 0x7f

#endif
