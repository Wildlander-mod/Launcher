int		Tonemapper <	//Decides how the bloom gets added to the scene
string	UIName = 	"Tonemapping algorithm";
string	UIWidget =	"Slider";
float   UIMin =     0;
float   UIMax =     8;
> =             	{1};   //Set default value here 

float	ModFilmicPoint1 <
string	UIName = 	"Modified filmic: Curve point one ";
string	UIWidget =	"Spinner";
float   UIMin =     0.0f;
float   UIMax =     100.0f;
> =             	{10.0f};   //Set default value here 

float	ModFilmicPoint2 <
string	UIName = 	"Modified filmic: Curve point two ";
string	UIWidget =	"Spinner";
float   UIMin =     0.0f;
float   UIMax =     100.0f;
> =             	{0.3f};   //Set default value here 

float	ModFilmicPoint3 <
string	UIName = 	"Modified filmic: Curve point three ";
string	UIWidget =	"Spinner";
float   UIMin =     0.0f;
float   UIMax =     100.0f;
> =             	{0.5f};   //Set default value here 

float	ModFilmicPoint4 <
string	UIName = 	"Modified filmic: Curve point four ";
string	UIWidget =	"Spinner";
float   UIMin =     0.0f;
float   UIMax =     100.0f;
> =             	{1.5f};   //Set default value here 

//use original game processing first, then mine
//#define APPLYGAMECOLORCORRECTION


float3 modifiedFilmic( in float3 color, in float mid1, in float toe, in float shoulder, in float mid2 )
{
	float a = 10.0; /// Mid
	float b = 0.3; /// Toe
	float c = 0.5; /// Shoulder
	float d = 1.5; /// Mid

	return	( color.rgb * (mid1 * color.rgb + toe ) ) / ( color.rgb * ( mid1 * color.rgb + shoulder ) + mid2 );
}
