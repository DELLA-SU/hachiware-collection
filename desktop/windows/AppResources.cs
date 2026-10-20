using System.Reflection;
using System.Text.Json;
namespace Hachiware;

// Assets travel inside the executable, even when it is moved or launched from a ZIP.
static class AppResources {
 static readonly Assembly Assembly=typeof(AppResources).Assembly;
 public static Stream Open(string name)=>Assembly.GetManifestResourceStream("Assets/"+name)??throw new FileNotFoundException("앱에 필요한 파일을 읽지 못했어요. 새 버전을 다시 받아 주세요.",name);
 public static Photo[] Photos(){using var stream=Open("catalog.json");return JsonSerializer.Deserialize<Photo[]>(stream)??throw new InvalidDataException("사진 목록을 읽지 못했어요.");}
 public static Image Image(string name){using var stream=Open(name);using var image=System.Drawing.Image.FromStream(stream);return new Bitmap(image);}
 public static Icon Icon(){using var stream=Open("Hachiware.ico");using var icon=new System.Drawing.Icon(stream);return (Icon)icon.Clone();}
 public static string[] Voices=>Assembly.GetManifestResourceNames().Where(n=>n.StartsWith("Assets/voices/",StringComparison.Ordinal)&&n.EndsWith(".wav",StringComparison.Ordinal)).Select(n=>n[7..]).ToArray();
}

static class AppFailure {
 public static string? Write(Exception error,string? directory=null){
  try{directory??=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Hachiware");Directory.CreateDirectory(directory);var path=Path.Combine(directory,"startup-error.txt");File.WriteAllText(path,$"치이 친구 {typeof(Program).Assembly.GetName().Version}\n{DateTimeOffset.Now:O}\n{System.Runtime.InteropServices.RuntimeInformation.OSDescription}\n{System.Runtime.InteropServices.RuntimeInformation.ProcessArchitecture}\n{error}");return path;}catch{return null;}
 }
 public static void Show(Exception error){var path=Write(error);Environment.ExitCode=1;MessageBox.Show("앱을 시작하거나 표시하지 못했어요.\n"+error.Message+(path is null?"":"\n\n오류 기록: "+path)+"\n\n이 창의 오류 내용을 알려 주세요.","치이 친구 실행 오류",MessageBoxButtons.OK,MessageBoxIcon.Error);}
}
