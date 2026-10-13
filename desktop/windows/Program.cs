using System.Diagnostics;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Media;
using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
namespace Hachiware;
static class Program {
 [STAThread] static void Main(string[] args){if(args.FirstOrDefault()=="--self-test"){Smoke.Run(args.ElementAtOrDefault(1)??"smoke-result.json");return;}using var mutex=new Mutex(true,"Local\\HachiwareDesktop",out var fresh);if(!fresh)return;ApplicationConfiguration.Initialize();Application.Run(new Pet());}
}
record Photo(string id,string image_url,string? character,string source,bool? draw_enabled=null);
sealed class Settings { public int X{get;set;} public int Y{get;set;} public bool Positioned{get;set;} public bool Sounds{get;set;}=true;public int CharacterSize{get;set;}=160;public int DrawCount{get;set;}public List<string> Seen{get;set;}=new(); }
sealed class Pet:Form {
 public const string Website="https://della-su.github.io/hachiware-collection/";
 static readonly string DataDir=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Hachiware");
 static readonly string SettingsFile=Path.Combine(DataDir,"settings.json");
 static string Asset(string path)=>Path.Combine(AppContext.BaseDirectory,"Assets",path);
 readonly Image character=Image.FromFile(Asset("character.png"));
 readonly System.Windows.Forms.Timer clock=new(){Interval=16},singleClick=new();
 readonly Flight flight=new(); readonly Stopwatch elapsed=Stopwatch.StartNew();
 readonly List<(Point p,double time)> samples=new(); readonly List<SoundPlayer> players=new();
 readonly NotifyIcon tray; readonly ContextMenuStrip menu=new(); readonly Random random=new();
 readonly ToolStripMenuItem sizeMenu=new("캐릭터 크기");
 internal static readonly int[] CharacterSizes=[120,160,200,240];
 readonly Photo[] photos; Settings settings; Point mouseStart,dragOrigin,home;Rectangle arena;bool dragging,moved,hover;double last,hoverTime,angle,squash,flightStart,returnX,returnY,spin=1100,lastBounce;int spinLevel;string? lastPhoto;MusicWindow? music;
 protected override bool ShowWithoutActivation=>true;
 protected override CreateParams CreateParams{get{var cp=base.CreateParams;cp.ExStyle|=0x80000|0x80;return cp;}}
 public Pet(){
  Directory.CreateDirectory(DataDir);try{settings=JsonSerializer.Deserialize<Settings>(File.ReadAllText(SettingsFile))??new();}catch{settings=new();}
  photos=JsonSerializer.Deserialize<Photo[]>(File.ReadAllText(Asset("catalog.json")))??[];
  if(!CharacterSizes.Contains(settings.CharacterSize))settings.CharacterSize=160;
  SetStyle(ControlStyles.StandardClick|ControlStyles.StandardDoubleClick,true);Text="하치와레";FormBorderStyle=FormBorderStyle.None;ShowInTaskbar=false;TopMost=true;StartPosition=FormStartPosition.Manual;ClientSize=new(settings.CharacterSize,settings.CharacterSize);
  Icon=new Icon(Path.Combine(AppContext.BaseDirectory,"Hachiware.ico"));
  var area=Screen.PrimaryScreen!.WorkingArea;Location=settings.Positioned?new(settings.X,settings.Y):new(area.Right-Width-50,area.Bottom-Height-100);ClampLocation();home=Location;
  menu.Items.Add("오늘의 하치와레 보여줘",null,(_,_)=>ShowPhoto());menu.Items.Add("웹 도감 열기",null,(_,_)=>Open(Website));menu.Items.Add("하치와레 노래 들으러 가기",null,(_,_)=>OpenMusic());
  menu.Items.Add("캐릭터 위치 초기화",null,(_,_)=>{flight.Active=false;Location=new(Screen.PrimaryScreen!.WorkingArea.Right-Width-50,Screen.PrimaryScreen.WorkingArea.Bottom-Height-100);ClampLocation();home=Location;Save();});
  foreach(var (title,size) in new[]{("작게 · 75%",120),("기본 · 100%",160),("크게 · 125%",200),("아주 크게 · 150%",240)}){var item=new ToolStripMenuItem(title){Tag=size,Checked=size==settings.CharacterSize};item.Click+=(_,_)=>ApplyCharacterSize(size);sizeMenu.DropDownItems.Add(item);}menu.Items.Add(sizeMenu);
  var sound=new ToolStripMenuItem("효과음 켜기"){Checked=settings.Sounds,CheckOnClick=true};sound.CheckedChanged+=(_,_)=>{settings.Sounds=sound.Checked;Save();if(!settings.Sounds)foreach(var p in players)p.Stop();};menu.Items.Add(sound);menu.Items.Add("설치 방법",null,(_,_)=>Open(Website));menu.Items.Add("종료",null,(_,_)=>Close());
  tray=new NotifyIcon{Icon=Icon,Text="하치와레",ContextMenuStrip=menu,Visible=true};tray.DoubleClick+=(_,_)=>OpenMusic();
  singleClick.Interval=SystemInformation.DoubleClickTime+40;singleClick.Tick+=(_,_)=>{singleClick.Stop();ShowPhoto();};
  MouseEnter+=(_,_)=>{hover=true;hoverTime=0;spinLevel=1;Sound("spin-1");};MouseLeave+=(_,_)=>{hover=false;hoverTime=0;spinLevel=0;};
  MouseDown+=Down;MouseMove+=DragMove;MouseUp+=Up;clock.Tick+=(_,_)=>Tick();Shown+=(_,_)=>{last=elapsed.Elapsed.TotalSeconds;clock.Start();Render();};
  FormClosed+=(_,_)=>{clock.Stop();singleClick.Stop();tray.Visible=false;tray.Dispose();music?.Close();character.Dispose();foreach(var p in players)p.Dispose();clock.Dispose();singleClick.Dispose();menu.Dispose();};
 }
 void ClampLocation(){var r=Screen.FromPoint(Location).WorkingArea;Location=new(Math.Clamp(Left,r.Left,Math.Max(r.Left,r.Right-Width)),Math.Clamp(Top,r.Top,Math.Max(r.Top,r.Bottom-Height)));}
 internal void ApplyCharacterSize(int size){if(!CharacterSizes.Contains(size))return;var center=new Point(Left+Width/2,Top+Height/2);flight.Active=false;hover=false;angle=0;squash=0;ClientSize=new(size,size);Location=new(center.X-size/2,center.Y-size/2);ClampLocation();home=Location;settings.CharacterSize=size;foreach(var item in sizeMenu.DropDownItems.OfType<ToolStripMenuItem>())item.Checked=(int)item.Tag! ==size;Save();if(IsHandleCreated)Render();}
 void Save(){settings.X=home.X;settings.Y=home.Y;settings.Positioned=true;try{File.WriteAllText(SettingsFile,JsonSerializer.Serialize(settings));}catch{}}
 void Down(object? s,MouseEventArgs e){if(e.Button==MouseButtons.Right){menu.Show(Cursor.Position);return;}if(e.Button!=MouseButtons.Left)return;singleClick.Stop();flight.Active=false;angle=0;dragging=true;moved=false;Capture=true;mouseStart=Cursor.Position;dragOrigin=Location;samples.Clear();samples.Add((Cursor.Position,elapsed.Elapsed.TotalSeconds));if(e.Clicks>=2){dragging=false;Capture=false;OpenMusic();}}
 void DragMove(object? s,MouseEventArgs e){if(!dragging)return;var p=Cursor.Position;var now=elapsed.Elapsed.TotalSeconds;samples.Add((p,now));samples.RemoveAll(v=>now-v.time>.12);moved|=Math.Abs(p.X-mouseStart.X)+Math.Abs(p.Y-mouseStart.Y)>5;Location=new(dragOrigin.X+p.X-mouseStart.X,dragOrigin.Y+p.Y-mouseStart.Y);}
 void Up(object? s,MouseEventArgs e){if(e.Button!=MouseButtons.Left||!dragging)return;dragging=false;Capture=false;if(!moved){singleClick.Start();return;}ClampLocation();home=Location;Save();var now=elapsed.Elapsed.TotalSeconds;var p=Cursor.Position;var sample=samples.FirstOrDefault();var dt=Math.Max(.016,now-sample.time);var vx=(p.X-sample.p.X)/dt;var vy=(p.Y-sample.p.Y)/dt;if(samples.Count>0&&now-sample.time<.16&&Math.Sqrt(vx*vx+vy*vy)>350)Launch(vx,vy);}
 void Launch(double vx,double vy){arena=Screen.FromControl(this).WorkingArea;flight.Start(Left,Top,vx,vy);flightStart=elapsed.Elapsed.TotalSeconds;hover=false;hoverTime=0;spin=vx<0?-1100:1100;Sound("launch");}
 void Tick(){var now=elapsed.Elapsed.TotalSeconds;var dt=Math.Clamp(now-last,0,.05);last=now;if(dragging)return;squash*=Math.Pow(.02,dt);
  if(flight.Active){var t=now-flightStart;angle+=spin*dt;
   if(t<3.8){var n=flight.Step(dt,arena.Left+8,arena.Top+8,Math.Max(arena.Left+8,arena.Right-Width-8),Math.Max(arena.Top+8,arena.Bottom-Height-8));if(n>0){squash=1;spin=(flight.Bounces%2==0?1:-1)*Math.Min(1750,1100+90*flight.Bounces);if(now-lastBounce>.075){Sound("bounce-"+(1+flight.Bounces%3));lastBounce=now;}}returnX=flight.X;returnY=flight.Y;Location=new((int)flight.X,(int)flight.Y);}
   else{var u=Math.Clamp((t-3.8)/.9,0,1);var ease=u*u*(3-2*u);Location=new((int)(returnX+(home.X-returnX)*ease),(int)(returnY+(home.Y-returnY)*ease-Math.Sin(u*Math.PI)*45));if(u>=1){flight.Active=false;angle=0;Sound("return");}}
  }else if(hover){hoverTime+=dt;var level=hoverTime>4?3:hoverTime>2?2:1;if(level!=spinLevel){spinLevel=level;Sound("spin-"+level);}angle+=Math.Min(720,240+hoverTime*100)*dt;if(hoverTime>=5)Launch(Left>Screen.FromControl(this).WorkingArea.Left+Screen.FromControl(this).WorkingArea.Width/2?-1450:1450,-1050);}
  else{angle*=Math.Pow(.01,dt);Location=new(home.X+(int)(Math.Sin(now*.65)*5),home.Y+(int)(Math.Sin(now*1.15)*9));}
  Render();
 }
 void Sound(string name,bool voice=false){if(!settings.Sounds)return;try{var p=new SoundPlayer(Asset((voice?"voices/":"sounds/")+name+".wav"));p.Load();p.Play();players.Add(p);while(players.Count>8){players[0].Dispose();players.RemoveAt(0);}}catch{}}
 void Voice(){var paths=Directory.GetFiles(Asset("voices"),"*.wav");if(paths.Length>0)Sound(Path.GetFileNameWithoutExtension(paths[random.Next(paths.Length)]),true);}
 internal void ShowPhoto(){var mainTurn=settings.DrawCount%6<5;var primary=new HashSet<string>{"hachiware","chiikawa","usagi","friends"};var candidates=photos.Where(p=>p.draw_enabled!=false&&primary.Contains(p.character??"friends")==mainTurn).ToArray();var fresh=candidates.Where(p=>!settings.Seen.Contains(p.id)).ToArray();var choices=fresh.Length>0?fresh:candidates.Where(p=>p.id!=lastPhoto).ToArray();if(choices.Length==0)choices=candidates;if(choices.Length==0)return;var photo=choices[random.Next(choices.Length)];lastPhoto=photo.id;settings.DrawCount++;if(!settings.Seen.Contains(photo.id))settings.Seen.Add(photo.id);Save();var path=Asset("photos/"+photo.id+".jpg");if(!File.Exists(path))return;
  Sound("reveal");if(photo.character=="usagi")Voice();var window=new Form{Text="오늘의 하치와레",StartPosition=FormStartPosition.CenterScreen,Size=new(760,760),MinimumSize=new(360,400),BackColor=Color.FromArgb(255,249,237),Icon=Icon};
  var image=Image.FromFile(path);var picture=new PictureBox{Dock=DockStyle.Fill,Image=image,SizeMode=PictureBoxSizeMode.Zoom};if(photo.character=="usagi")picture.Click+=(_,_)=>Voice();
  var buttons=new FlowLayoutPanel{Dock=DockStyle.Bottom,Height=64,Padding=new(16),FlowDirection=FlowDirection.LeftToRight};var website=new Button{Text="웹사이트 바로가기 ↗",AutoSize=true,Height=32};website.Click+=(_,_)=>Open(DesktopPhotoUrl(photo.id));var source=new Button{Text="사진 출처 ↗",AutoSize=true,Height=32};source.Click+=(_,_)=>Open(photo.source);buttons.Controls.Add(website);buttons.Controls.Add(source);window.Controls.Add(picture);window.Controls.Add(buttons);window.FormClosed+=(_,_)=>image.Dispose();window.Show();
 }
 internal static string DesktopPhotoUrl(string id)=>Website+"#desktop_photo="+Uri.EscapeDataString(id)+"&request="+Guid.NewGuid().ToString();
 void OpenMusic(){if(music is {IsDisposed:false}){music.Activate();return;}music=new MusicWindow(Icon!,DataDir);music.Show();}
 public static void Open(string url){if(Uri.TryCreate(url,UriKind.Absolute,out var uri)&&uri.Scheme=="https")try{Process.Start(new ProcessStartInfo(url){UseShellExecute=true});}catch{MessageBox.Show("브라우저를 열지 못했어요. 웹사이트에서 다시 열어 주세요.","하치와레");}}
 internal bool Render(){if(!IsHandleCreated||IsDisposed)return false;using var bitmap=new Bitmap(Width,Height,PixelFormat.Format32bppArgb);using(var g=Graphics.FromImage(bitmap)){g.Clear(Color.Transparent);g.SmoothingMode=SmoothingMode.AntiAlias;g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.TranslateTransform(Width/2f,Height/2f);g.RotateTransform((float)(angle%360));g.ScaleTransform((float)(1+.26*squash),(float)(1-.2*squash));var side=Math.Min(Width,Height)-24f;var ratio=(float)character.Width/character.Height;var w=ratio>1?side:side*ratio;var h=ratio>1?side/ratio:side;g.DrawImage(character,-w/2,-h/2,w,h);}return Layered.Draw(Handle,bitmap,Location);}
}
sealed class MusicWindow:Form {
 readonly WebView2 view=new(){Dock=DockStyle.Fill};readonly string data;
 public MusicWindow(Icon icon,string dataDir){data=dataDir;Text="하치와레 노래 들으러 가기";Icon=icon;Size=new(920,660);MinimumSize=new(420,320);StartPosition=FormStartPosition.CenterScreen;BackColor=Color.FromArgb(216,234,237);Controls.Add(view);Shown+=async(_,_)=>await LoadTV();FormClosed+=(_,_)=>view.Dispose();}
 async Task LoadTV(){try{var env=await CoreWebView2Environment.CreateAsync(null,Path.Combine(data,"MusicBrowser"),new CoreWebView2EnvironmentOptions("--autoplay-policy=no-user-gesture-required"));if(IsDisposed)return;await view.EnsureCoreWebView2Async(env);if(IsDisposed)return;view.CoreWebView2.Settings.AreDevToolsEnabled=false;view.CoreWebView2.NewWindowRequested+=(_,e)=>{e.Handled=true;Pet.Open(e.Uri);};view.Source=new Uri(Pet.Website+"desktop-tv.html");}
 catch{if(IsDisposed)return;Controls.Remove(view);var label=new Label{Text="노래 창에는 Microsoft WebView2가 필요해요.\n웹사이트에서는 바로 들을 수 있어요.",AutoSize=true,Location=new(24,24)};var open=new Button{Text="브라우저에서 노래 열기",AutoSize=true,Location=new(24,90)};open.Click+=(_,_)=>Pet.Open(Pet.Website+"desktop-tv.html");var install=new Button{Text="Microsoft WebView2 공식 다운로드",AutoSize=true,Location=new(24,140)};install.Click+=(_,_)=>Pet.Open("https://developer.microsoft.com/microsoft-edge/webview2/");Controls.Add(label);Controls.Add(open);Controls.Add(install);}}
}
static class Layered {
 [StructLayout(LayoutKind.Sequential)] struct PointI{public int X,Y;public PointI(int x,int y){X=x;Y=y;}}
 [StructLayout(LayoutKind.Sequential)] struct SizeI{public int W,H;public SizeI(int w,int h){W=w;H=h;}}
 [StructLayout(LayoutKind.Sequential,Pack=1)] struct Blend{public byte Op,Flags,Alpha,Format;}
 [DllImport("user32.dll")]static extern IntPtr GetDC(IntPtr hwnd);[DllImport("user32.dll")]static extern int ReleaseDC(IntPtr hwnd,IntPtr dc);
 [DllImport("gdi32.dll")]static extern IntPtr CreateCompatibleDC(IntPtr dc);[DllImport("gdi32.dll")]static extern IntPtr SelectObject(IntPtr dc,IntPtr obj);[DllImport("gdi32.dll")]static extern bool DeleteObject(IntPtr obj);[DllImport("gdi32.dll")]static extern bool DeleteDC(IntPtr dc);
 [DllImport("user32.dll",SetLastError=true)]static extern bool UpdateLayeredWindow(IntPtr hwnd,IntPtr dst,ref PointI point,ref SizeI size,IntPtr src,ref PointI origin,uint color,ref Blend blend,uint flags);
 public static bool Draw(IntPtr hwnd,Bitmap bitmap,Point position){var screen=GetDC(IntPtr.Zero);var dc=CreateCompatibleDC(screen);var hb=bitmap.GetHbitmap(Color.FromArgb(0));var old=SelectObject(dc,hb);try{var p=new PointI(position.X,position.Y);var size=new SizeI(bitmap.Width,bitmap.Height);var origin=new PointI(0,0);var blend=new Blend{Alpha=255,Format=1};return UpdateLayeredWindow(hwnd,screen,ref p,ref size,dc,ref origin,0,ref blend,2);}finally{SelectObject(dc,old);DeleteObject(hb);DeleteDC(dc);ReleaseDC(IntPtr.Zero,screen);}}
}
