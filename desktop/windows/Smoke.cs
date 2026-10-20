using System.Text.Json;
namespace Hachiware;
static class Smoke {
 public static void Run(string report){
  try{
   var photos=AppResources.Photos();
   if(photos.Length<55)throw new Exception("Missing catalog");foreach(var photo in photos){using var image=AppResources.Image("photos/"+photo.id+".jpg");if(image.Width<1)throw new Exception("Invalid photo");}
   using var character=AppResources.Image("character.png");using var icon=AppResources.Icon();
   var voices=AppResources.Voices;if(voices.Length!=14)throw new Exception("Missing voices");foreach(var voice in voices){using var stream=AppResources.Open(voice);if(stream.Length<44)throw new Exception("Invalid voice");}
   var now=DateTimeOffset.Parse("2026-10-20T14:59:59Z");var state=new Settings();var seen=new HashSet<string>();
   var count=photos.Count(p=>p.draw_enabled!=false);
   for(var i=0;i<count;i++){var pool=PhotoDraws.Pool(photos,state,now);if(pool.Length==0)throw new Exception("Premature daily exhaustion");var chosen=pool[0];if(!seen.Add(chosen.id))throw new Exception("Same-day repeat");PhotoDraws.Record(state,chosen.id,now);state=JsonSerializer.Deserialize<Settings>(JsonSerializer.Serialize(state))!;}
   if(PhotoDraws.Pool(photos,state,now).Length!=0||PhotoDraws.Pool(photos,state,now.AddSeconds(1)).Length==0||PhotoDraws.Day(now.AddSeconds(1))!="2026-10-21")throw new Exception("Daily reset failed");
   var url=new Uri(Pet.DesktopPhotoUrl(photos[0].id));if(!url.Fragment.Contains(photos[0].id)||url.Query!="?skip_intro=1")throw new Exception("Exact photo handoff failed");
   foreach(var area in new[]{new Rectangle(0,0,1280,720),new Rectangle(0,0,1024,550),new Rectangle(0,0,1920,1080)}){var size=Pet.PhotoWindowSize(area);if(size.Width>=area.Width||size.Height>=area.Height)throw new Exception("Photo window outside screen");}
   var f=new Flight();f.Start(50,50,1600,-800);for(var i=0;i<228;i++){f.Step(1.0/60,0,0,640,440);if(f.X<0||f.X>640||f.Y<0||f.Y>440)throw new Exception("Flight outside bounds");}if(f.Bounces<3)throw new Exception("No bouncing");
   var diagnostic=AppFailure.Write(new InvalidDataException("Diagnostic check"),Path.Combine(Path.GetTempPath(),"hachiware-smoke-"+Guid.NewGuid()));if(diagnostic is null||!File.ReadAllText(diagnostic).Contains("Diagnostic check"))throw new Exception("Startup diagnostic failed");
   ApplicationConfiguration.Initialize();using var pet=new Pet(testing:true);
   pet.Shown+=(_,_)=>pet.BeginInvoke((Action)(()=>{
    try{
     if(!pet.Render())throw new Exception("Layered rendering failed");var originalSize=pet.ClientSize.Width;
     foreach(var size in Pet.CharacterSizes){pet.ApplyCharacterSize(size);if(pet.ClientSize.Width!=size||pet.ClientSize.Height!=size||!pet.Render())throw new Exception("Character resize failed");if(!Screen.FromControl(pet).WorkingArea.Contains(pet.Bounds))throw new Exception("Mascot outside screen");}pet.ApplyCharacterSize(originalSize);
     pet.ShowPhoto();var window=Application.OpenForms.Cast<Form>().Single(x=>x!=pet);window.PerformLayout();
     void CheckButtons(){var footer=window.Controls.OfType<Panel>().Single();var panel=footer.Controls.OfType<TableLayoutPanel>().Single();var buttons=panel.Controls.OfType<Button>().OrderBy(b=>b.Left).ToArray();var scale=footer.DeviceDpi/96f;if(buttons.Length!=2||buttons[0].Text!="보관함 저장하기"||buttons[1].Text!="웹사이트 바로가기 ↗"||Math.Abs(buttons[0].Top-buttons[1].Top)>1||buttons[0].Right>buttons[1].Left||panel.Bottom>footer.ClientSize.Height||panel.Width>313*scale||panel.Height>35*scale||Math.Abs(panel.Left-(footer.ClientSize.Width-panel.Width)/2)>1)throw new Exception("Compact horizontal CTAs are missing or clipped");foreach(var button in buttons){if(TextRenderer.MeasureText(button.Text,button.Font).Width>button.ClientSize.Width)throw new Exception("CTA text is clipped");}}
     CheckButtons();window.Size=window.MinimumSize;window.PerformLayout();CheckButtons();
     using var tv=new MusicWindow(icon,Path.GetTempPath());
     File.WriteAllText(report,JsonSerializer.Serialize(new{passed=true,version=typeof(Program).Assembly.GetName().Version?.ToString(),os=Environment.OSVersion.VersionString,photos=photos.Length,voices=voices.Length,dailyUnique=count,standaloneAssets=true,startupDiagnostics=true,layeredWindow=pet.IsHandleCreated,photoWindow=true,horizontalCTAs=true,characterSizes=Pet.CharacterSizes}));
     foreach(var form in Application.OpenForms.Cast<Form>().Where(x=>x!=pet).ToArray())form.Close();
    }catch(Exception e){File.WriteAllText(report,JsonSerializer.Serialize(new{passed=false,error=e.ToString()}));Environment.ExitCode=1;}finally{pet.Close();}
   }));Application.Run(pet);
  }catch(Exception e){File.WriteAllText(report,JsonSerializer.Serialize(new{passed=false,error=e.ToString()}));Environment.ExitCode=1;}
 }
}
