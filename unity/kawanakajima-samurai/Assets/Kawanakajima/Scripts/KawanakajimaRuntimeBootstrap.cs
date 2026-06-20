using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using GLTFast;
using GLTFast.Materials;
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
    private bool usingFallbackActors;
    private bool usingFallbackPack;
    private bool foundryBattlefieldPackReady;
    private bool showingFoundryBattlefieldPack;
    private string status = "LOADING FOUNDRY SAMURAI";
    private Vector2 previousMouse;

    private static readonly IMaterialGenerator GltfMaterialGenerator = new ShaderSafeGltfMaterialGenerator();

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

    private sealed class ShaderSafeGltfMaterialGenerator : IMaterialGenerator
    {
        public UnityEngine.Material GetDefaultMaterial(bool pointsSupport = false)
        {
            return null;
        }

        public UnityEngine.Material GenerateMaterial(GLTFast.Schema.MaterialBase gltfMaterial, IGltfReadable gltf, bool pointsSupport = false)
        {
            return null;
        }

        public void SetLogger(GLTFast.Logging.ICodeLogger logger)
        {
        }
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
        status = assetsReady
            ? (usingFallbackActors ? "KAWANAKAJIMA_UNITY_READY_FALLBACK" : "KAWANAKAJIMA_UNITY_READY")
            : "UNITY HANDOFF LOAD FAILED";
        Debug.Log(status + " actors=" + actors.Count + " pack=" + foundryBattlefieldPackReady + " audio=" + (musicSource.clip != null) + " fallbackActors=" + usingFallbackActors + " fallbackPack=" + usingFallbackPack);
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
        if (shader == null)
        {
            Debug.LogWarning("KAWANAKAJIMA_SHADER_FALLBACK material=" + name + " Standard shader unavailable; using Unity primitive default material");
            return null;
        }

        var material = new Material(shader) { name = name, color = color };
        if (material.HasProperty("_Glossiness")) material.SetFloat("_Glossiness", 0.08f);
        return material;
    }

    private static void ApplySharedMaterial(Renderer renderer, Material material)
    {
        if (renderer != null && material != null) renderer.sharedMaterial = material;
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
        ApplySharedMaterial(ground.GetComponent<Renderer>(), groundMat);

        for (int i = 0; i < 5; i++)
        {
            var hill = GameObject.CreatePrimitive(PrimitiveType.Cube);
            hill.name = "Distant ink hill " + (i + 1);
            hill.transform.position = new Vector3(-18f + i * 9f, 0.35f, 14f + (i % 2) * 3f);
            hill.transform.rotation = Quaternion.Euler(0f, -8f + i * 4f, 0f);
            hill.transform.localScale = new Vector3(8f, 0.7f + i * 0.08f, 3.1f);
            ApplySharedMaterial(hill.GetComponent<Renderer>(), hillMat);
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
            ApplySharedMaterial(stone.GetComponent<Renderer>(), stoneMat);
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
        ApplySharedMaterial(trunk.GetComponent<Renderer>(), trunkMat);

        for (int layer = 0; layer < 3; layer++)
        {
            var crown = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            crown.name = "pine crown";
            crown.transform.SetParent(root.transform, false);
            crown.transform.localPosition = new Vector3(0f, (1.08f + layer * 0.38f) * scale, 0f);
            crown.transform.localScale = new Vector3((0.72f - layer * 0.14f) * scale, 0.18f * scale, (0.72f - layer * 0.14f) * scale);
            ApplySharedMaterial(crown.GetComponent<Renderer>(), treeMat);
        }
    }

    private async Task LoadSamuraiFormation()
    {
        var url = StreamingAssetUrl(samuraiGlbStreamingAssetsPath);
        var gltf = new GltfImport(null, null, GltfMaterialGenerator, null);
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
            bool success;
            try
            {
                success = await gltf.InstantiateMainSceneAsync(root.transform);
            }
            catch (Exception exc)
            {
                Debug.LogWarning("KAWANAKAJIMA_GLTF_ACTOR_FALLBACK index=" + i + " reason=" + exc.GetType().Name + ": " + exc.Message);
                success = false;
            }

            if (!success)
            {
                UnityEngine.Object.Destroy(root);
                root = CreateFallbackSamuraiActor(takeda, i);
                usingFallbackActors = true;
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
        var gltf = new GltfImport(null, null, GltfMaterialGenerator, null);
        var loaded = await gltf.Load(url);
        if (!loaded)
        {
            Debug.LogWarning("Optional 20-samurai Foundry battlefield pack was not loaded from " + url);
            return;
        }

        foundryBattlefieldPackRoot = new GameObject("Foundry_20_Samurai_Battlefield_Pack");
        bool instantiated;
        try
        {
            instantiated = await gltf.InstantiateMainSceneAsync(foundryBattlefieldPackRoot.transform);
        }
        catch (Exception exc)
        {
            Debug.LogWarning("KAWANAKAJIMA_GLTF_PACK_FALLBACK reason=" + exc.GetType().Name + ": " + exc.Message);
            instantiated = false;
        }

        if (!instantiated)
        {
            UnityEngine.Object.Destroy(foundryBattlefieldPackRoot);
            foundryBattlefieldPackRoot = CreateFallbackBattlefieldPack();
            usingFallbackPack = true;
        }

        foundryBattlefieldPackRoot.transform.position = new Vector3(0f, 0.02f, -1.2f);
        foundryBattlefieldPackRoot.transform.localScale = Vector3.one * 1.15f;
        foundryBattlefieldPackRoot.SetActive(false);
        foundryBattlefieldPackReady = true;
    }

    private GameObject CreateFallbackSamuraiActor(bool takeda, int index)
    {
        var root = new GameObject((takeda ? "Takeda" : "Uesugi") + "_FallbackSamurai_" + (index % 10 + 1).ToString("00"));

        var body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        body.name = "fallback armored body";
        body.transform.SetParent(root.transform, false);
        body.transform.localPosition = new Vector3(0f, 1.05f, 0f);
        body.transform.localScale = new Vector3(0.34f, 0.72f, 0.24f);

        var helmet = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        helmet.name = "fallback kabuto helmet";
        helmet.transform.SetParent(root.transform, false);
        helmet.transform.localPosition = new Vector3(0f, 1.92f, -0.02f);
        helmet.transform.localScale = new Vector3(0.34f, 0.18f, 0.28f);

        var armor = GameObject.CreatePrimitive(PrimitiveType.Cube);
        armor.name = takeda ? "fallback red armor plate" : "fallback blue armor plate";
        armor.transform.SetParent(root.transform, false);
        armor.transform.localPosition = new Vector3(0f, 1.18f, -0.18f);
        armor.transform.localScale = new Vector3(0.46f, 0.48f, 0.07f);
        ApplySharedMaterial(armor.GetComponent<Renderer>(), takeda ? takedaMat : uesugiMat);

        var sashimono = GameObject.CreatePrimitive(PrimitiveType.Cube);
        sashimono.name = "fallback sashimono";
        sashimono.transform.SetParent(root.transform, false);
        sashimono.transform.localPosition = new Vector3(takeda ? -0.32f : 0.32f, 1.88f, 0.24f);
        sashimono.transform.localScale = new Vector3(0.28f, 0.42f, 0.035f);
        ApplySharedMaterial(sashimono.GetComponent<Renderer>(), takeda ? takedaMat : uesugiMat);

        var blade = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        blade.name = "fallback katana";
        blade.transform.SetParent(root.transform, false);
        blade.transform.localPosition = new Vector3(takeda ? 0.42f : -0.42f, 1.12f, -0.20f);
        blade.transform.localRotation = Quaternion.Euler(0f, 0f, takeda ? -35f : 35f);
        blade.transform.localScale = new Vector3(0.025f, 0.72f, 0.025f);

        return root;
    }

    private GameObject CreateFallbackBattlefieldPack()
    {
        var root = new GameObject("Fallback_20_Samurai_Battlefield_Pack");
        for (int i = 0; i < ActorCount; i++)
        {
            bool takeda = i < 10;
            var marker = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            marker.name = (takeda ? "Fallback Takeda pack marker " : "Fallback Uesugi pack marker ") + (i % 10 + 1).ToString("00");
            marker.transform.SetParent(root.transform, false);
            marker.transform.localPosition = new Vector3((takeda ? -3.0f : 3.0f) + (i % 10 - 4.5f) * 0.36f, 0.72f, (i % 3 - 1) * 0.25f);
            marker.transform.localRotation = Quaternion.Euler(0f, takeda ? 82f : -82f, 0f);
            marker.transform.localScale = new Vector3(0.18f, 0.72f, 0.18f);
            ApplySharedMaterial(marker.GetComponent<Renderer>(), takeda ? takedaMat : uesugiMat);
        }
        return root;
    }

    private static string StreamingAssetUrl(string relativePath)
    {
        string path = Path.Combine(Application.streamingAssetsPath, relativePath);
        return path.Contains("://") ? path : "file://" + path;
    }


    private static async Task<object> LoadGltf(string url)
    {
        var type = FindType("GLTFast.GltfImport");
        if (type == null)
        {
            Debug.LogWarning("glTFast is not compiled yet; GLB loading is unavailable for " + url);
            return null;
        }

        var gltf = CreateGltfImport(type);
        if (gltf == null)
        {
            Debug.LogWarning("glTFast GltfImport constructor API was not found.");
            return null;
        }

        var load = FindMethod(type, "Load", parameters => parameters.Length > 0 && parameters[0].ParameterType == typeof(string));
        if (load == null)
        {
            Debug.LogWarning("glTFast Load(string) API was not found.");
            return null;
        }

        var loaded = await AwaitBooleanTask(load.Invoke(gltf, BuildArgs(load.GetParameters(), url)));
        return loaded ? gltf : null;
    }

    private static async Task<bool> InstantiateGltfMainScene(object gltf, Transform parent)
    {
        var method = FindMethod(gltf.GetType(), "InstantiateMainSceneAsync", parameters => parameters.Length > 0 && parameters[0].ParameterType == typeof(Transform));
        if (method == null)
        {
            Debug.LogWarning("glTFast InstantiateMainSceneAsync(Transform) API was not found.");
            return false;
        }

        return await AwaitBooleanTask(method.Invoke(gltf, BuildArgs(method.GetParameters(), parent)));
    }

    private static object CreateGltfImport(Type type)
      {
         // For GLTFast.GltfImport, we need the 4-interface constructor.
         // Discover concrete implementations via reflection.
        var downloadProvider = FindType("GLTFast.Loading.DefaultDownloadProvider");
        var deferAgent = FindType("GLTFast.TimeBudgetPerFrameDeferAgent");
        var materialGenerator = FindType("GLTFast.Materials.BuiltInMaterialGenerator");
        var codeLogger = FindType("GLTFast.Logging.ConsoleLogger");

         if (downloadProvider != null && deferAgent != null && materialGenerator != null && codeLogger != null)
           {
            var ctor = type.GetConstructor(new[] { downloadProvider, deferAgent, materialGenerator, codeLogger });
            if (ctor != null)
               {
                object dp = Activator.CreateInstance(downloadProvider);
                object da = Activator.CreateInstance(deferAgent);
                object mg = Activator.CreateInstance(materialGenerator);
                object cl = Activator.CreateInstance(codeLogger);
                return ctor.Invoke(new object[] { dp, da, mg, cl });
               }
           }

          // Fallback: try all constructors via BuildArgs
        foreach (var constructor in type.GetConstructors(BindingFlags.Instance | BindingFlags.Public))
          {
            try
              {
                return constructor.Invoke(BuildArgs(constructor.GetParameters()));
              }
            catch (Exception ex)
              {
                Debug.LogWarning($"glTFast GltfImport constructor fallback failed: {ex.Message}");
              }
          }

        return null;
      }
    private static System.Reflection.MethodInfo FindMethod(Type type, string name, Func<System.Reflection.ParameterInfo[], bool> predicate)
    {
        foreach (var method in type.GetMethods(BindingFlags.Instance | BindingFlags.Public))
        {
            if (method.Name != name) continue;
            var parameters = method.GetParameters();
            if (predicate(parameters)) return method;
        }

        return null;
    }

    private static object[] BuildArgs(System.Reflection.ParameterInfo[] parameters, params object[] provided)
    {
        var args = new object[parameters.Length];
        for (int i = 0; i < parameters.Length; i++)
        {
            if (i < provided.Length)
            {
                args[i] = provided[i];
                continue;
            }

            var parameterType = parameters[i].ParameterType;
            var defaultValue = parameters[i].HasDefaultValue ? parameters[i].DefaultValue : null;
            if (defaultValue != null && defaultValue != DBNull.Value && defaultValue != Type.Missing)
            {
                args[i] = defaultValue;
                continue;
            }

            args[i] = parameterType.IsValueType ? Activator.CreateInstance(parameterType) : null;
        }

        return args;
    }

    private static Type FindType(string fullName)
    {
        foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
        {
            var type = assembly.GetType(fullName, false);
            if (type != null) return type;
        }
        return null;
    }

    private static async Task<bool> AwaitBooleanTask(object value)
    {
        if (value is Task<bool> booleanTask) return await booleanTask;
        if (value is Task task)
        {
            await task;
            var resultProperty = task.GetType().GetProperty("Result");
            return resultProperty == null || resultProperty.GetValue(task) is true;
        }
        return value is true;
    }

