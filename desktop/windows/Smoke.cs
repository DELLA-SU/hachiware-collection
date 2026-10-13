using System.Text.Json;
namespace Hachiware;
static class Smoke {
 public static void Run(string report){
  try{
   var assets=Path.Combine(AppContext.BaseDirectory,"Assets");var photos=JsonSerializer.Deserialize<Photo[]>(File.ReadAllText(Path.Combine(assets,"catalog.json")))!;
   if(photos.Length<55)throw new Exception("Missing catalog");foreach(var photo in photos){using var image=Image.FromFile(Path.Combine(assets,"photos",photo.id+".jpg"));if(image.Width<1)throw new Exception("Invalid photo");}
   using var character=Image.FromFile(Path.Combine(assets,"character.png"));using var icon=new Icon(Path.Combine(AppContext.BaseDirectory,"Hachiware.ico"));
   if(Directory.GetFiles(Path.Combine(assets,"voices"),"*.wav").Length!=14)throw new Exception("Missing voices");
   var f=new Flight();f.Start(50,50,1600,-800);for(var i=0;i<228;i++){f.Step(1.0/60,0,0,640,440);if(f.X<0||f.X>640||f.Y<0||f.Y>440)throw new Exception("Flight outside bounds");}if(f.Bounces<3)throw new Exception("No bouncing");
   ApplicationConfiguration.Initialize();using var pet=new Pet();pet.Shown+=(_,_)=>pet.BeginInvoke((Action)(()=>{try{if(!pet.Render())throw new Exception("Layered rendering failed");var originalSize=pet.ClientSize.Width;foreach(var size in Pet.CharacterSizes){pet.ApplyCharacterSize(size);if(pet.ClientSize.Width!=size||pet.ClientSize.Height!=size||!pet.Render())throw new Exception("Character resize failed");var area=Screen.FromControl(pet).WorkingArea;if(!area.Contains(pet.Bounds))throw new Exception("Resized character outside screen");}pet.ApplyCharacterSize(originalSize);pet.ShowPhoto();if(Application.OpenForms.Count<2)throw new Exception("Photo window missing");File.WriteAllText(report,JsonSerializer.Serialize(new{passed=true,photos=photos.Length,voices=14,bounces=f.Bounces,layeredWindow=pet.IsHandleCreated,photoWindow=true,characterSizes=Pet.CharacterSizes}));foreach(var form in Application.OpenForms.Cast<Form>().Where(x=>x!=pet).ToArray())form.Close();}catch(Exception e){File.WriteAllText(report,JsonSerializer.Serialize(new{passed=false,error=e.ToString()}));Environment.ExitCode=1;}finally{pet.Close();}}));Application.Run(pet);
  }catch(Exception e){File.WriteAllText(report,JsonSerializer.Serialize(new{passed=false,error=e.ToString()}));Environment.ExitCode=1;}
 }
}
