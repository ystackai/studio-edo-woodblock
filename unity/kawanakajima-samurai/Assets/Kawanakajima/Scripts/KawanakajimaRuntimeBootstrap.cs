using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using GLTFast;
using UnityEngine;

public sealed class KawanakajimaRuntimeBootstrap : MonoBehaviour
{
    private const int ActorCount = 20;

    [Header("Foundry asset paths")]
    public string samuraiGlbStreamingAssetsPath = "Kawanakajima/samurai_character.glb";
    public string battlefieldPackGlbStreamingAssetsPath = "Kawanakajima/samurai_battlefield_pack.glb";

    private readonly List<Actor> actors = new List<Actor>();
    private readonly Vector3 cameraDefaultTarget = new Vector3(0f, 1.7f, -2.2f);

    private Camera mainCamera;
    private GameObject foundryBattlefieldPackRoot;
    private AudioSource musicSource;
    private AudioSource sfxSource;
    private AudioClip chargeCue;
    private AudioClip clashAccent;
    private AudioClip formationStep;
    private AudioClip uiConfirm;

    private Material groundMat;
    private Material hillMat;
    private Material treeMat;
    private Material trunkMat;
    private Material stoneMat;
    private Material takedaMat;
    private Material uesugiMat;
    private Material poleMat;

    private Vector3 cameraTarget;
    private float yaw = -0.68f;
    private float pitch = 0.24f;
    private float distance = 14.5f;
    private bool charging;
    private bool musicEnabled;
    private bool assetsReady;
    private bool foundryBattlefieldPackReady;
    private bool showingFoundryBattlefieldPack;
    private string status = "LOADING FOUNDRY SAMURAI";
    private Vector2 previousMouse;

    private sealed class Actor
    {
        public GameObject Root;
        public bool Takeda;
        public int Index;
        public Vector3 BasePosition;
        public Quaternion BaseRotation;
        public Vector3 ChargeTarget;
        public float IdlePhase;
    }

    private async void Start()
    {
        CreateMaterials();
        CreateCameraAndAudio();
        BuildCountryside();
        await LoadSamuraiFormation();
        await LoadFoundryBattlefieldPack();
        ApplyCameraPreset("overview");
        assetsReady = actors.Count == ActorCount;
        status = assetsReady ? "KAWANAKAJIMA_UNITY_READY" : "UNITY HANDOFF LOAD FAILED";
        Debug.Log(status + " actors=" + actors.Count + " pack=" + foundryBattlefieldPackReady + " audio=" + (musicSource.clip != null));
    }

    private void Update()
    {
        HandleInput();
        AnimateActors(Time.deltaTime);
        UpdateCamera();
    }

    private void OnGUI()
    {
        const int pad = 14;
        GUI.Box(new Rect(pad, pad, 490, 118), string.Empty);
        GUI.Label(new Rect(pad + 12, pad + 8, 360, 24), "KAWANAKAJIMA - UNITY HANDOFF");
        GUI.Label(new Rect(pad + 12, pad + 30, 360, 22), "20 samurai: 10 Takeda / 10 Uesugi");
        GUI.Label(new Rect(pad + 12, pad + 52, 360, 22), status);

        if (GUI.Button(new Rect(pad + 12, pad + 80, 58, 26), "1 Wide")) ApplyCameraPreset("overview");
        if (GUI.Button(new Rect(pad + 74, pad + 80, 58, 26), "2 Red")) ApplyCameraPreset("red");
        if (GUI.Button(new Rect(pad + 136, pad + 80, 58, 26), "3 Blue")) ApplyCameraPreset("blue");
        if (GUI.Button(new Rect(pad + 198, pad + 80, 58, 26), "4 Side")) ApplyCameraPreset("side");
        if (GUI.Button(new Rect(pad + 260, pad + 80, 58, 26), "5 Top")) ApplyCameraPreset("top");
        if (GUI.Button(new Rect(pad + 322, pad + 80, 58, 26), "6 Inspect")) ApplyCameraPreset("inspect");

        int y = pad + 132;
        if (GUI.Button(new Rect(pad, y, 86, 30), "CHARGE")) Charge();
        if (GUI.Button(new Rect(pad + 92, y, 86, 30), "REFORM")) Reform();
        if (GUI.Button(new Rect(pad + 184, y, 86, 30), musicEnabled ? "AUDIO ON" : "AUDIO")) ToggleMusic();
        if (GUI.Button(new Rect(pad + 276, y, 86, 30), "CLASH")) PlaySfx(clashAccent);
        if (GUI.Button(new Rect(pad + 368, y, 96, 30), showingFoundryBattlefieldPack ? "PACK ON" : "PACK")) ToggleFoundryBattlefieldPack();
    }

    private void CreateMaterials()
    {
        groundMat = MakeMaterial("Paper earth", new Color(0.46f, 0.41f, 0.33f));
        hillMat = MakeMaterial("Distant ink hills", new Color(0.27f, 0.33f, 0.31f));
        treeMat = MakeMaterial("Pine ink", new Color(0.12f, 0.26f, 0.20f));
        trunkMat = MakeMaterial("Pine trunk", new Color(0.26f, 0.19f, 0.13f));
        stoneMat = MakeMaterial("Low stone", new Color(0.35f, 0.35f, 0.33f));
        takedaMat = MakeMaterial("Takeda standard", new Color(0.60f, 0.08f, 0.05f));
        uesugiMat = MakeMaterial("Uesugi standard", new Color(0.08f, 0.17f, 0.48f));
        poleMat = MakeMaterial("Dark pole", new Color(0.08f, 0.06f, 0.04f));
    }

    private static Material MakeMaterial(string name, Color color)
    {
        var shader = Shader.Find("Standard");
        var material = new Material(shader) { name = name, color = color };
        material.SetFloat("_Glossiness", 0.08f);
        return material;
    }

    private void CreateCameraAndAudio()
    {
        var cameraObject = new GameObject("Kawanakajima Camera");
        mainCamera = cameraObject.AddComponent<Camera>();
        mainCamera.fieldOfView = 38f;
        mainCamera.nearClipPlane = 0.03f;
        mainCamera.farClipPlane = 220f;
        mainCamera.tag = "MainCamera";

        var listener = cameraObject.AddComponent<AudioListener>();
        listener.enabled = true;

        RenderSettings.fog = true;
        RenderSettings.fogColor = new Color(0.70f, 0.73f, 0.69f);
        RenderSettings.fogDensity = 0.018f;
        RenderSettings.ambientLight = new Color(0.42f, 0.43f, 0.39f);

        var sunObject = new GameObject("Cool key light");
        var sun = sunObject.AddComponent<Light>();
        sun.type = LightType.Directional;
        sun.color = new Color(0.92f, 0.96f, 1f);
        sun.intensity = 1.22f;
        sunObject.transform.rotation = Quaternion.Euler(42f, -32f, 0f);

        var rimObject = new GameObject("Warm rim light");
        var rim = rimObject.AddComponent<Light>();
        rim.type = LightType.Directional;
        rim.color = new Color(1f, 0.78f, 0.54f);
        rim.intensity = 0.34f;
        rimObject.transform.rotation = Quaternion.Euler(24f, 132f, 0f);

        musicSource = gameObject.AddComponent<AudioSource>();
        musicSource.clip = Resources.Load<AudioClip>("KawanakajimaAudio/battlefield_loop");
        musicSource.loop = true;
        musicSource.volume = 0.38f;

        sfxSource = gameObject.AddComponent<AudioSource>();
        sfxSource.volume = 0.72f;
        chargeCue = Resources.Load<AudioClip>("KawanakajimaAudio/charge_cue");
        clashAccent = Resources.Load<AudioClip>("KawanakajimaAudio/clash_accent");
        formationStep = Resources.Load<AudioClip>("KawanakajimaAudio/formation_step");
        uiConfirm = Resources.Load<AudioClip>("KawanakajimaAudio/ui_confirm");
    }

    private void BuildCountryside()
    {
        var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
        ground.name = "Japanese countryside ground";
        ground.transform.localScale = new Vector3(18f, 1f, 12f);
        ground.GetComponent<Renderer>().sharedMaterial = groundMat;

        for (int i = 0; i < 5; i++)
        {
            var hill = GameObject.CreatePrimitive(PrimitiveType.Cube);
            hill.name = "Distant ink hill " + (i + 1);
            hill.transform.position = new Vector3(-18f + i * 9f, 0.35f, 14f + (i % 2) * 3f);
            hill.transform.rotation = Quaternion.Euler(0f, -8f + i * 4f, 0f);
            hill.transform.localScale = new Vector3(8f, 0.7f + i * 0.08f, 3.1f);
            hill.GetComponent<Renderer>().sharedMaterial = hillMat;
        }

        for (int i = 0; i < 18; i++)
        {
            float side = i % 2 == 0 ? -1f : 1f;
            float x = side * (9.0f + (i % 5) * 1.7f);
            float z = -8.5f + (i * 2.15f) % 18f;
            CreatePine(new Vector3(x, 0f, z), 0.78f + (i % 3) * 0.16f);
        }

        for (int i = 0; i < 24; i++)
        {
            var stone = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            stone.name = "Low field stone";
            stone.transform.position = new Vector3(-9f + (i * 1.91f) % 18f, 0.08f, -7.4f + (i * 2.73f) % 15f);
            stone.transform.localScale = new Vector3(0.22f + (i % 4) * 0.04f, 0.08f, 0.16f + (i % 5) * 0.03f);
            stone.GetComponent<Renderer>().sharedMaterial = stoneMat;
        }
    }

    private void CreatePine(Vector3 position, float scale)
    {
        var root = new GameObject("Ink pine");
        root.transform.position = position;

        var trunk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        trunk.name = "trunk";
        trunk.transform.SetParent(root.transform, false);
        trunk.transform.localPosition = new Vector3(0f, 0.52f * scale, 0f);
        trunk.transform.localScale = new Vector3(0.12f * scale, 0.52f * scale, 0.12f * scale);
        trunk.GetComponent<Renderer>().sharedMaterial = trunkMat;

        for (int layer = 0; layer < 3; layer++)
        {
            var crown = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            crown.name = "pine crown";
            crown.transform.SetParent(root.transform, false);
            crown.transform.localPosition = new Vector3(0f, (1.08f + layer * 0.38f) * scale, 0f);
            crown.transform.localScale = new Vector3((0.72f - layer * 0.14f) * scale, 0.18f * scale, (0.72f - layer * 0.14f) * scale);
            crown.GetComponent<Renderer>().sharedMaterial = treeMat;
        }
    }

    private async Task LoadSamuraiFormation()
    {
        var url = StreamingAssetUrl(samuraiGlbStreamingAssetsPath);
        var gltf = new GltfImport();
        var loaded = await gltf.Load(url);
        if (!loaded)
        {
            Debug.LogError("Failed to load Foundry GLB from " + url);
            return;
        }

        for (int i = 0; i < ActorCount; i++)
        {
            bool takeda = i < 10;
            var root = new GameObject((takeda ? "Takeda" : "Uesugi") + "_Samurai_" + (i % 10 + 1).ToString("00"));
            var success = await gltf.InstantiateMainSceneAsync(root.transform);
            if (!success)
            {
                Debug.LogError("Failed to instantiate Foundry Samurai " + i);
                UnityEngine.Object.Destroy(root);
                continue;
            }

            ConfigureActorRoot(root, i, takeda);
            AddFactionStandard(root.transform, takeda, i);
            if (i % 3 == 0) AddYari(root.transform, takeda, i);

            var actor = new Actor
            {
                Root = root,
                Takeda = takeda,
                Index = i,
                BasePosition = root.transform.position,
                BaseRotation = root.transform.rotation,
                ChargeTarget = root.transform.position,
                IdlePhase = i * 0.47f
            };
            actors.Add(actor);
        }
    }

    private async Task LoadFoundryBattlefieldPack()
    {
        var url = StreamingAssetUrl(battlefieldPackGlbStreamingAssetsPath);
        var gltf = new GltfImport();
        var loaded = await gltf.Load(url);
        if (!loaded)
        {
            Debug.LogWarning("Optional 20-samurai Foundry battlefield pack was not loaded from " + url);
            return;
        }

        foundryBattlefieldPackRoot = new GameObject("Foundry_20_Samurai_Battlefield_Pack");
        var instantiated = await gltf.InstantiateMainSceneAsync(foundryBattlefieldPackRoot.transform);
        if (!instantiated)
        {
            Debug.LogWarning("Optional 20-samurai Foundry battlefield pack failed to instantiate");
            UnityEngine.Object.Destroy(foundryBattlefieldPackRoot);
            foundryBattlefieldPackRoot = null;
            return;
        }

        foundryBattlefieldPackRoot.transform.position = new Vector3(0f, 0.02f, -1.2f);
        foundryBattlefieldPackRoot.transform.localScale = Vector3.one * 1.15f;
        foundryBattlefieldPackRoot.SetActive(false);
        foundryBattlefieldPackReady = true;
    }

    private static string StreamingAssetUrl(string relativePath)
    {
        string path = Path.Combine(Application.streamingAssetsPath, relativePath);
        return path.Contains("://") ? path : "file://" + path;
    }

    private void ConfigureActorRoot(GameObject root, int index, bool takeda)
    {
        int local = index % 10;
        float x = (takeda ? -7.4f : 7.4f) + (local - 4.5f) * 1.05f;
        float z = -5.8f + (local % 3 - 1) * 0.2f;
        root.transform.position = new Vector3(x, 0f, z);
        root.transform.rotation = Quaternion.Euler(0f, takeda ? 87f : -87f, 0f);
        root.transform.localScale = Vector3.one * (0.96f + (index % 5) * 0.012f);

        ApplyPoseVariant(root.transform, index, takeda);
    }

    private static void ApplyPoseVariant(Transform root, int index, bool takeda)
    {
        float guard = takeda ? -7f : 7f;
        foreach (var child in root.GetComponentsInChildren<Transform>(true))
        {
            string name = child.name.ToLowerInvariant();
            if (name.Contains("helmet") || name.Contains("kabuto"))
            {
                child.localRotation *= Quaternion.Euler(0f, (index % 5 - 2) * 1.8f, 0f);
            }
            if (name.Contains("left") && (name.Contains("arm") || name.Contains("kote") || name.Contains("gloved hand")))
            {
                child.localRotation *= Quaternion.Euler(guard, 0f, 2f + index % 4);
            }
            if (name.Contains("right") && (name.Contains("arm") || name.Contains("kote") || name.Contains("gloved hand")))
            {
                child.localRotation *= Quaternion.Euler(-guard * 0.55f, 0f, -2f - index % 3);
            }
            if (name.Contains("sashimono") || name.Contains("banner"))
            {
                child.localRotation *= Quaternion.Euler((index % 4 - 1) * 1.5f, 0f, takeda ? -3f : 3f);
            }
        }
    }

    private void AddFactionStandard(Transform parent, bool takeda, int index)
    {
        var pole = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        pole.name = "Faction standard pole";
        pole.transform.SetParent(parent, false);
        pole.transform.localPosition = new Vector3(takeda ? -0.28f : 0.28f, 1.95f, -0.36f);
        pole.transform.localRotation = Quaternion.Euler(0f, 0f, takeda ? -5f : 5f);
        pole.transform.localScale = new Vector3(0.025f, 0.78f, 0.025f);
        pole.GetComponent<Renderer>().sharedMaterial = poleMat;

        var cloth = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cloth.name = takeda ? "Takeda red standard" : "Uesugi blue standard";
        cloth.transform.SetParent(parent, false);
        cloth.transform.localPosition = new Vector3(takeda ? -0.28f : 0.28f, 2.45f, -0.36f);
        cloth.transform.localRotation = Quaternion.Euler(0f, 0f, takeda ? -5f : 5f);
        cloth.transform.localScale = new Vector3(0.36f, 0.48f, 0.018f);
        cloth.GetComponent<Renderer>().sharedMaterial = takeda ? takedaMat : uesugiMat;
    }

    private void AddYari(Transform parent, bool takeda, int index)
    {
        var shaft = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        shaft.name = "Additive yari shaft";
        shaft.transform.SetParent(parent, false);
        shaft.transform.localPosition = new Vector3(takeda ? 0.58f : -0.58f, 1.38f, 0.03f);
        shaft.transform.localRotation = Quaternion.Euler(0f, 0f, takeda ? -22f : 22f);
        shaft.transform.localScale = new Vector3(0.018f, 1.35f, 0.018f);
        shaft.GetComponent<Renderer>().sharedMaterial = poleMat;

        var tip = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        tip.name = "Additive yari blade";
        tip.transform.SetParent(parent, false);
        tip.transform.localPosition = new Vector3(takeda ? 0.98f : -0.98f, 2.64f, 0.03f);
        tip.transform.localRotation = Quaternion.Euler(0f, 0f, takeda ? -22f : 22f);
        tip.transform.localScale = new Vector3(0.045f, 0.18f, 0.045f);
        tip.GetComponent<Renderer>().sharedMaterial = stoneMat;
    }

    private void HandleInput()
    {
        if (Input.GetKeyDown(KeyCode.Alpha1)) ApplyCameraPreset("overview");
        if (Input.GetKeyDown(KeyCode.Alpha2)) ApplyCameraPreset("red");
        if (Input.GetKeyDown(KeyCode.Alpha3)) ApplyCameraPreset("blue");
        if (Input.GetKeyDown(KeyCode.Alpha4)) ApplyCameraPreset("side");
        if (Input.GetKeyDown(KeyCode.Alpha5)) ApplyCameraPreset("top");
        if (Input.GetKeyDown(KeyCode.Alpha6)) ApplyCameraPreset("inspect");
        if (Input.GetKeyDown(KeyCode.C)) Charge();
        if (Input.GetKeyDown(KeyCode.R)) Reform();
        if (Input.GetKeyDown(KeyCode.A)) ToggleMusic();
        if (Input.GetKeyDown(KeyCode.X)) PlaySfx(clashAccent);
        if (Input.GetKeyDown(KeyCode.P)) ToggleFoundryBattlefieldPack();

        if (Input.GetMouseButtonDown(0)) previousMouse = Input.mousePosition;
        if (Input.GetMouseButton(0))
        {
            Vector2 current = Input.mousePosition;
            Vector2 delta = current - previousMouse;
            yaw -= delta.x * 0.004f;
            pitch = Mathf.Clamp(pitch + delta.y * 0.003f, 0.08f, 1.35f);
            previousMouse = current;
        }

        float wheel = Input.GetAxis("Mouse ScrollWheel");
        if (Mathf.Abs(wheel) > 0.001f)
        {
            distance = Mathf.Clamp(distance - wheel * 8f, 2.6f, 42f);
        }
    }

    private void AnimateActors(float dt)
    {
        for (int i = 0; i < actors.Count; i++)
        {
            var actor = actors[i];
            if (actor.Root == null) continue;
            Vector3 basePos = actor.BasePosition;
            Vector3 current = actor.Root.transform.position;
            current.y = basePos.y + Mathf.Sin(Time.time * 1.55f + actor.IdlePhase) * 0.015f;
            if (charging)
            {
                current = Vector3.Lerp(current, actor.ChargeTarget, Mathf.Clamp01(dt * 2.8f));
                actor.Root.transform.rotation = actor.BaseRotation * Quaternion.Euler(actor.Takeda ? 5f : -5f, 0f, 0f);
            }
            else
            {
                current.x = Mathf.Lerp(current.x, basePos.x, Mathf.Clamp01(dt * 4.2f));
                current.z = Mathf.Lerp(current.z, basePos.z, Mathf.Clamp01(dt * 4.2f));
                actor.Root.transform.rotation = Quaternion.Slerp(actor.Root.transform.rotation, actor.BaseRotation, Mathf.Clamp01(dt * 4.2f));
            }
            actor.Root.transform.position = current;
        }
    }

    private void Charge()
    {
        charging = true;
        status = "CHARGING";
        for (int i = 0; i < actors.Count; i++)
        {
            var actor = actors[i];
            float direction = actor.Takeda ? 1f : -1f;
            actor.ChargeTarget = actor.BasePosition + new Vector3(direction * 3.9f, 0f, ((i % 5) - 2) * 0.16f);
        }
        PlaySfx(chargeCue);
        Invoke(nameof(PlayClash), 0.72f);
    }

    private void Reform()
    {
        charging = false;
        status = "REFORM";
        PlaySfx(formationStep);
        Invoke(nameof(SetReadyStatus), 0.28f);
    }

    private void SetReadyStatus()
    {
        status = assetsReady ? "KAWANAKAJIMA_UNITY_READY" : status;
    }

    private void PlayClash()
    {
        PlaySfx(clashAccent);
    }

    private void ToggleMusic()
    {
        if (musicSource.clip == null)
        {
            status = "AUDIO CLIP MISSING";
            return;
        }
        musicEnabled = !musicEnabled;
        if (musicEnabled) musicSource.Play();
        else musicSource.Stop();
        PlaySfx(uiConfirm);
    }

    private void ToggleFoundryBattlefieldPack()
    {
        if (!foundryBattlefieldPackReady || foundryBattlefieldPackRoot == null)
        {
            status = "FOUNDRY PACK MISSING";
            return;
        }

        showingFoundryBattlefieldPack = !showingFoundryBattlefieldPack;
        foundryBattlefieldPackRoot.SetActive(showingFoundryBattlefieldPack);
        foreach (var actor in actors)
        {
            if (actor.Root != null) actor.Root.SetActive(!showingFoundryBattlefieldPack);
        }
        status = showingFoundryBattlefieldPack ? "FOUNDRY 20-SAMURAI PACK VIEW" : "KAWANAKAJIMA_UNITY_READY";
        PlaySfx(uiConfirm);
    }

    private void PlaySfx(AudioClip clip)
    {
        if (clip != null) sfxSource.PlayOneShot(clip);
    }

    private void ApplyCameraPreset(string preset)
    {
        switch (preset)
        {
            case "red":
                cameraTarget = actors.Count > 3 ? actors[3].Root.transform.position + new Vector3(0f, 1.55f, 0.15f) : new Vector3(-5f, 1.7f, -5f);
                yaw = -0.72f; pitch = 0.30f; distance = 5.3f;
                status = "RED CLOSE";
                break;
            case "blue":
                cameraTarget = actors.Count > 13 ? actors[13].Root.transform.position + new Vector3(0f, 1.55f, 0.15f) : new Vector3(5f, 1.7f, -5f);
                yaw = -1.58f; pitch = 0.30f; distance = 5.0f;
                status = "BLUE CLOSE";
                break;
            case "side":
                cameraTarget = new Vector3(0f, 1.6f, -2f);
                yaw = -3.02f; pitch = 0.22f; distance = 14.5f;
                status = "SIDE PROFILE";
                break;
            case "top":
                cameraTarget = new Vector3(0f, 1.4f, -4f);
                yaw = -1.55f; pitch = 1.20f; distance = 18.5f;
                status = "TOP FORMATION";
                break;
            case "inspect":
                cameraTarget = actors.Count > 8 ? actors[8].Root.transform.position + new Vector3(0f, 1.48f, 0.18f) : new Vector3(-5f, 1.8f, -5f);
                yaw = -0.72f; pitch = 0.31f; distance = 4.35f;
                status = "INSPECT ASSET";
                break;
            default:
                cameraTarget = cameraDefaultTarget;
                yaw = -0.68f; pitch = 0.24f; distance = 14.5f;
                status = assetsReady ? "KAWANAKAJIMA_UNITY_READY" : status;
                break;
        }
    }

    private void UpdateCamera()
    {
        if (mainCamera == null) return;
        float cp = Mathf.Cos(pitch);
        var offset = new Vector3(
            Mathf.Sin(yaw) * cp * distance,
            Mathf.Sin(pitch) * distance,
            Mathf.Cos(yaw) * cp * distance
        );
        mainCamera.transform.position = cameraTarget + offset;
        mainCamera.transform.LookAt(cameraTarget);
    }
}
