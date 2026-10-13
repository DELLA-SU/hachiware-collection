# Windows 치이 친구

Windows 10/11 x64 및 Windows 11 ARM64용 .NET 10 Windows Forms 앱입니다.

- 투명한 바탕화면 캐릭터, 한 번 클릭하면 랜덤 사진, 더블클릭하면 WebView2 TV 창
- 드래그로 위치 이동, 빠르게 놓으면 화면 안에서 회전하며 튕긴 뒤 돌아오기
- 5초 동안 마우스를 올리면 자동 회전·튕기기
- 오른쪽 클릭 또는 시스템 트레이에서 노래, 웹 도감, 효과음, 캐릭터 크기, 위치 초기화, 종료
- 55장 사진과 우사기 목소리 14개를 포함합니다. 사진 선택은 바로 이전 사진을 피합니다.
- 캐릭터 크기는 75%·100%·125%·150% 중 선택하고, 다시 실행해도 유지됩니다.
- 설정만 %LOCALAPPDATA%/Hachiware에 저장합니다. 웹 도감 기록과 자동 동기화하지 않습니다.

.NET은 배포 파일에 포함됩니다. Assets 폴더와 Hachiware.ico를 실행 파일 옆에 유지해야 합니다.
노래에는 인터넷 연결과 Microsoft WebView2 Runtime이 필요합니다. 없으면 공식 설치 페이지와 브라우저 재생을 안내합니다. 앱이 런타임을 자동 설치하거나 보안 설정을 변경하지 않습니다.

앱에는 배포 인증서 서명이 없습니다. SmartScreen 경고가 나타날 수 있습니다. 실제 위협 탐지 경고는 무시하지 마세요.

빌드:

```
dotnet publish desktop/windows/Hachiware.csproj -c Release -r win-x64 --self-contained true -o publish/x64
dotnet publish desktop/windows/Hachiware.csproj -c Release -r win-arm64 --self-contained true -o publish/arm64
```

`Hachiware.exe --self-test report.json`은 Windows에서 사진/아이콘/목소리 묶음, 충돌 물리, 투명 창 렌더링과 사진 창을 확인합니다. GitHub Actions windows-desktop.yml에서 실행합니다. 이 검사는 마우스의 실제 조작감이나 인터넷 영상 재생을 보장하지 않습니다.
