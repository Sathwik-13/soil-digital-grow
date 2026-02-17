import React from "react";

const ResearchPaper = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 max-w-4xl mx-auto font-serif leading-relaxed">
      <style>{`
        .eq-box {
          background: #f8f9fa;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px 24px;
          margin: 16px 0;
          text-align: center;
          font-family: 'Georgia', serif;
          font-size: 1.1rem;
        }
        .eq-label {
          float: right;
          color: #666;
          font-size: 0.9rem;
        }
        .var {
          font-style: italic;
          font-family: 'Georgia', serif;
        }
        .sub {
          font-size: 0.7em;
          vertical-align: sub;
        }
        .sup {
          font-size: 0.7em;
          vertical-align: super;
        }
        .sum-symbol {
          font-size: 1.6em;
          vertical-align: middle;
        }
        .prod-symbol {
          font-size: 1.6em;
          vertical-align: middle;
        }
        .frac {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          vertical-align: middle;
          margin: 0 4px;
        }
        .frac-num {
          border-bottom: 1.5px solid #333;
          padding: 0 6px 2px;
          font-size: 0.95em;
        }
        .frac-den {
          padding: 2px 6px 0;
          font-size: 0.95em;
        }
        .section-num {
          font-weight: bold;
          margin-right: 8px;
        }
        h2 { font-size: 1.5rem; font-weight: bold; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 2px solid #333; padding-bottom: 0.5rem; }
        h3 { font-size: 1.25rem; font-weight: bold; margin-top: 2rem; margin-bottom: 0.75rem; }
        h4 { font-size: 1.1rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .where-block { margin: 12px 0 12px 24px; font-size: 0.95rem; }
        .where-block div { margin: 4px 0; }
        table.algo-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.9rem; }
        table.algo-table th, table.algo-table td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
        table.algo-table th { background: #f1f5f9; font-weight: 600; }
        .code-ref { font-family: monospace; font-size: 0.85rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
      `}</style>

      {/* SECTION 3.1 */}
      <h2><span className="section-num">3.1</span>System Architecture</h2>

      <p>
        The proposed system follows a <strong>three-tier client-server architecture</strong> comprising a Presentation Layer 
        (React 18 + TypeScript), a Processing Layer (algorithmic computation engine), and a Data/AI Layer 
        (serverless edge functions with Gemini AI integration).
      </p>

      <h3>3.1.1 Design Patterns</h3>
      <p>The system employs three core software design patterns:</p>
      <ul style={{ listStyleType: 'disc', marginLeft: '24px', marginBottom: '16px' }}>
        <li><strong>Component-Based Architecture:</strong> Each agricultural feature (disease detection, nutrient analysis, yield prediction) is encapsulated as an independent, reusable React component with isolated state management.</li>
        <li><strong>Strategy Pattern:</strong> Crop-specific configurations (Tomato, Chili, Brinjal) are stored as interchangeable data objects in <span className="code-ref">CROP_DATA</span>, allowing the same algorithmic functions to operate on different crop parameters without code modification.</li>
        <li><strong>Observer Pattern:</strong> Environmental parameter changes propagate unidirectionally through the system — a single state update (e.g., temperature change) cascades through health calculation, disease risk assessment, ripening speed, and 3D visualization simultaneously.</li>
      </ul>

      <h3>3.1.2 System Architecture Block Diagram</h3>
      <div style={{ border: '2px solid #333', borderRadius: '8px', padding: '24px', margin: '16px 0', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.8' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'serif' }}>
          Figure 1: System Architecture Block Diagram
        </div>
        <pre style={{ whiteSpace: 'pre', overflow: 'auto' }}>{`
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐            │
│  │  Landing  │  │ Dashboard │  │ 3D Field  │            │
│  │   Page    │  │   Page    │  │   View    │            │
│  └──────────┘  └─────┬─────┘  └───────────┘            │
│                      │                                   │
│  ┌──────────┬────────┼────────┬──────────┐              │
│  │ Crop     │ Growth │ Soil   │ Environ- │              │
│  │ Selector │ Timeline│ AI Chat│ mental   │              │
│  │          │        │        │ Sliders  │              │
│  └────┬─────┴────┬───┴───┬────┴────┬─────┘              │
└───────┼──────────┼───────┼────────┼──────────────────────┘
        │          │       │        │
        ▼          ▼       ▼        ▼
┌─────────────────────────────────────────────────────────┐
│                   PROCESSING LAYER                       │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  Plant Health   │  │   Ripening     │                 │
│  │  Calculator     │  │   Speed Model  │                 │
│  │  H = 100 - Σwᵢδᵢ│  │   S(T) sigmoid │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  Disease/Pest   │  │   Nutrient     │                 │
│  │  Detection      │  │   Analysis     │                 │
│  │  Rule Engine    │  │   Linear Map   │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  Yield          │  │  3D Growth     │                 │
│  │  Prediction     │  │  Parametric    │                 │
│  │  Multi-Factor   │  │  Renderer      │                 │
│  └────────────────┘  └────────────────┘                 │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA / AI LAYER                        │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  Crop Data      │  │  Ripeness Data │                 │
│  │  (cropData.ts)  │  │  (ripenessData)│                 │
│  └────────────────┘  └────────────────┘                 │
│                                                          │
│  ┌──────────────────────────────────────┐               │
│  │  Serverless Edge Functions (Deno)    │               │
│  │  ┌──────────────┐ ┌───────────────┐ │               │
│  │  │ soil-ai-chat │ │ analyze-field │ │               │
│  │  │ (Gemini 2.5  │ │ -photo       │ │               │
│  │  │  Flash)      │ │ (Vision AI)  │ │               │
│  │  └──────────────┘ └───────────────┘ │               │
│  └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘`}
        </pre>
      </div>

      <h3>3.1.3 Data Flow</h3>
      <div style={{ border: '2px solid #333', borderRadius: '8px', padding: '24px', margin: '16px 0', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'serif' }}>
          Figure 2: Data Flow Diagram
        </div>
        <pre style={{ whiteSpace: 'pre', overflow: 'auto' }}>{`
  USER INPUT                    PROCESSING                      OUTPUT
  ─────────                    ──────────                      ──────

  ┌───────────┐          ┌─────────────────┐          ┌──────────────────┐
  │ Crop      │─────────▶│ Load Crop Config│─────────▶│ Stage Timeline   │
  │ Selection │          │ (Strategy       │          │ Growth Metrics   │
  └───────────┘          │  Pattern)       │          └──────────────────┘
                         └─────────────────┘
  ┌───────────┐          ┌─────────────────┐          ┌──────────────────┐
  │ Temp (°C) │─────┐    │                 │     ┌───▶│ Health Score (%) │
  │ Moisture %│─────┤    │  Multi-Factor   │     │    │ Disease Alerts   │
  │ pH Value  │─────┼───▶│  Weighted       │─────┤    │ Pest Warnings    │
  │ Humidity %│─────┤    │  Calculator     │     │    │ Nutrient Levels  │
  │ Light %   │─────┘    │                 │     └───▶│ Yield Estimate   │
  └───────────┘          └─────────────────┘          └──────────────────┘

  ┌───────────┐          ┌─────────────────┐          ┌──────────────────┐
  │ Week      │─────────▶│ Parametric 3D   │─────────▶│ 3D Virtual Field │
  │ Slider    │          │ Growth Engine   │          │ (Three.js)       │
  │           │          │ + Ripening Model│          │ Color + Size     │
  └───────────┘          └─────────────────┘          └──────────────────┘

  ┌───────────┐          ┌─────────────────┐          ┌──────────────────┐
  │ Text Query│─────────▶│ Gemini 2.5 Flash│─────────▶│ AI Chat Response │
  │ (Chat)    │          │ (SSE Streaming) │          │ (Real-time)      │
  └───────────┘          └─────────────────┘          └──────────────────┘`}
        </pre>
      </div>

      {/* SECTION 3.2 */}
      <h2><span className="section-num">3.2</span>Algorithm Design and Implementation</h2>

      <p>
        This section presents the mathematical models and algorithms implemented for crop monitoring, 
        environmental analysis, and predictive simulation.
      </p>

      {/* 3.2.1 Plant Health */}
      <h3>3.2.1 Plant Health Index — Weighted Penalty Model</h3>
      <p>
        Plant health is computed as a deviation-based penalty model. Starting from a base score of 100, 
        penalties are subtracted proportional to how far each environmental parameter deviates from its 
        crop-specific optimal range.
      </p>

      <div className="eq-box">
        <span className="eq-label">(Eq. 1)</span>
        <var>H</var> = 100 − 
        <span className="sum-symbol">Σ</span><span className="sub"><var>i</var>=1</span><span className="sup"><var>n</var></span> 
        &nbsp;<var>w</var><span className="sub"><var>i</var></span> · <var>δ</var><span className="sub"><var>i</var></span>
      </div>

      <div className="where-block">
        <div>Where:</div>
        <div>• <var>H</var> = Plant Health Index (0–100%)</div>
        <div>• <var>w</var><span className="sub"><var>i</var></span> = Weight coefficient for the <var>i</var>-th environmental factor</div>
        <div>• <var>δ</var><span className="sub"><var>i</var></span> = Deviation of parameter from its optimal range boundary</div>
        <div>• <var>n</var> = Number of environmental factors (5: moisture, temperature, pH, humidity, light)</div>
      </div>

      <p>The deviation <var>δ</var><span className="sub"><var>i</var></span> is computed as a <strong>piecewise function</strong>:</p>

      <div className="eq-box">
        <span className="eq-label">(Eq. 2)</span>
        <var>δ</var><span className="sub"><var>i</var></span> = 
        &nbsp;|<var>x</var><span className="sub"><var>i</var></span> − <var>bound</var><span className="sub"><var>i</var></span>| 
        &nbsp;&nbsp; if <var>x</var><span className="sub"><var>i</var></span> ∉ [<var>opt</var><span className="sub">min</span>, <var>opt</var><span className="sub">max</span>]
        &nbsp;&nbsp;;&nbsp;&nbsp; 0 &nbsp;&nbsp; otherwise
      </div>

      <div className="where-block">
        <div>Where <var>bound</var><span className="sub"><var>i</var></span> = nearest optimal range boundary (min or max)</div>
      </div>

      <table className="algo-table">
        <thead>
          <tr>
            <th>Factor (<var>i</var>)</th>
            <th>Weight (<var>w</var><span className="sub"><var>i</var></span>)</th>
            <th>Optimal Range (Tomato)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Moisture</td><td>0.8 (low) / 0.6 (high)</td><td>60–80%</td></tr>
          <tr><td>Temperature</td><td>2.0 (low) / 2.5 (high)</td><td>21–29°C</td></tr>
          <tr><td>Soil pH</td><td>12.0</td><td>6.0–6.8</td></tr>
          <tr><td>Humidity</td><td>0.3 (low) / 0.4 (high)</td><td>50–70%</td></tr>
          <tr><td>Light Intensity</td><td>0.4 (below 50%)</td><td>≥ 50%</td></tr>
        </tbody>
      </table>

      <p><strong>Implementation:</strong> <span className="code-ref">calculatePlantHealth()</span> in <span className="code-ref">src/data/cropData.ts</span>, lines 302–364.</p>

      {/* 3.2.2 Ripening Speed */}
      <h3>3.2.2 Ripening Speed — Temperature-Dependent Piecewise Model</h3>
      <p>
        The ripening speed function models the biological relationship between ambient temperature and 
        fruit maturation rate. It employs a piecewise linear function with five distinct thermal regions.
      </p>

      <div className="eq-box">
        <span className="eq-label">(Eq. 3)</span>
        <div style={{ textAlign: 'left', display: 'inline-block' }}>
          <div style={{ marginBottom: '6px' }}>
            <var>S</var>(<var>T</var>) = 
          </div>
          <div style={{ marginLeft: '40px' }}>
            <table style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ padding: '4px 12px', borderLeft: '2px solid #333' }}>0.0</td><td style={{ padding: '4px 12px' }}>if <var>T</var> &lt; <var>T</var><span className="sub">min</span> − 8</td></tr>
                <tr><td style={{ padding: '4px 12px', borderLeft: '2px solid #333' }}>0.3 + 0.2 · <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}><span style={{ borderBottom: '1px solid #333', padding: '0 4px' }}><var>T</var> − (<var>T</var><span className="sub">min</span> − 8)</span><span style={{ padding: '0 4px' }}>8</span></span></td><td style={{ padding: '4px 12px' }}>if <var>T</var><span className="sub">min</span> − 8 ≤ <var>T</var> &lt; <var>T</var><span className="sub">min</span></td></tr>
                <tr><td style={{ padding: '4px 12px', borderLeft: '2px solid #333' }}>1.0</td><td style={{ padding: '4px 12px' }}>if <var>T</var><span className="sub">min</span> ≤ <var>T</var> ≤ <var>T</var><span className="sub">max</span></td></tr>
                <tr><td style={{ padding: '4px 12px', borderLeft: '2px solid #333' }}>1.2</td><td style={{ padding: '4px 12px' }}>if <var>T</var><span className="sub">max</span> &lt; <var>T</var> ≤ <var>T</var><span className="sub">max</span> + 5</td></tr>
                <tr><td style={{ padding: '4px 12px', borderLeft: '2px solid #333' }}>0.8</td><td style={{ padding: '4px 12px' }}>if <var>T</var> &gt; <var>T</var><span className="sub">max</span> + 5</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="where-block">
        <div>Where:</div>
        <div>• <var>S</var>(<var>T</var>) = Ripening speed multiplier (0.0–1.2)</div>
        <div>• <var>T</var> = Current ambient temperature (°C)</div>
        <div>• <var>T</var><span className="sub">min</span>, <var>T</var><span className="sub">max</span> = Crop-specific optimal temperature range</div>
        <div>• Optimal ranges: Tomato (20–25°C), Chili (22–28°C), Brinjal (24–30°C)</div>
      </div>

      <p>The effective ripening progression is then:</p>

      <div className="eq-box">
        <span className="eq-label">(Eq. 4)</span>
        <var>D</var><span className="sub">adj</span> = <var>D</var><span className="sub">raw</span> × <var>S</var>(<var>T</var>)
      </div>

      <div className="where-block">
        <div>Where <var>D</var><span className="sub">adj</span> = Adjusted ripening days, <var>D</var><span className="sub">raw</span> = Actual elapsed days</div>
      </div>

      <p><strong>Implementation:</strong> <span className="code-ref">calculateRipeningSpeed()</span> in <span className="code-ref">src/data/ripenessData.ts</span>, lines 137–161.</p>

      {/* 3.2.3 Ripeness Percentage */}
      <h3>3.2.3 Ripeness Percentage Calculation</h3>

      <div className="eq-box">
        <span className="eq-label">(Eq. 5)</span>
        <var>R</var><span className="sub">%</span> = min(100, &nbsp;
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
          <span style={{ borderBottom: '1.5px solid #333', padding: '0 8px 2px' }}><var>D</var><span className="sub">adj</span></span>
          <span style={{ padding: '2px 8px 0' }}><var>D</var><span className="sub">max</span></span>
        </span>
        &nbsp;× 100 )
      </div>

      <div className="where-block">
        <div>Where <var>D</var><span className="sub">max</span> = Maximum ripening days for the crop (Tomato: 7, Chili: 10, Brinjal: 8)</div>
      </div>

      {/* 3.2.4 Disease Detection */}
      <h3>3.2.4 Disease Detection — Rule-Based Expert System</h3>
      <p>
        Disease risk is determined using a <strong>forward-chaining production rule engine</strong>. 
        Each disease has a set of environmental preconditions. The confidence score is calculated as the 
        ratio of matched conditions to total conditions.
      </p>

      <div className="eq-box">
        <span className="eq-label">(Eq. 6)</span>
        <var>C</var><span className="sub">disease</span> = 
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
          <span style={{ borderBottom: '1.5px solid #333', padding: '0 8px 2px' }}><var>M</var><span className="sub">matched</span></span>
          <span style={{ padding: '2px 8px 0' }}><var>M</var><span className="sub">total</span></span>
        </span>
        &nbsp;× 100
      </div>

      <div className="where-block">
        <div>Where:</div>
        <div>• <var>C</var><span className="sub">disease</span> = Confidence percentage for a specific disease</div>
        <div>• <var>M</var><span className="sub">matched</span> = Number of environmental conditions that match the disease profile</div>
        <div>• <var>M</var><span className="sub">total</span> = Total number of conditions defined for that disease</div>
      </div>

      <p><strong>Example production rule</strong> (Late Blight in Tomato):</p>
      <div style={{ background: '#f8f9fa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 24px', margin: '12px 0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
        IF Temperature ∈ [15, 22]°C<br/>
        AND Humidity &gt; 80%<br/>
        AND Moisture &gt; 75%<br/>
        THEN Risk = "Late Blight", Confidence = (matched / 3) × 100
      </div>

      <p><strong>Implementation:</strong> <span className="code-ref">DiseaseDetection.tsx</span>, rule matching logic within the component.</p>

      {/* 3.2.5 Nutrient Analysis */}
      <h3>3.2.5 Nutrient Analysis — Bounded Linear Mapping</h3>
      <p>
        Soil nutrient levels (N, P, K) are estimated using bounded linear regression approximations 
        that map soil pH and moisture to nutrient availability.
      </p>

      <div className="eq-box">
        <span className="eq-label">(Eq. 7)</span>
        <var>N</var><span className="sub">avail</span> = clamp( <var>α</var><span className="sub">N</span> · <var>pH</var> + <var>β</var><span className="sub">N</span> · <var>M</var> + <var>γ</var><span className="sub">N</span> , &nbsp; <var>N</var><span className="sub">min</span> , &nbsp; <var>N</var><span className="sub">max</span> )
      </div>

      <div className="eq-box">
        <span className="eq-label">(Eq. 8)</span>
        <var>P</var><span className="sub">avail</span> = clamp( <var>α</var><span className="sub">P</span> · <var>pH</var> + <var>β</var><span className="sub">P</span> · <var>M</var> + <var>γ</var><span className="sub">P</span> , &nbsp; <var>P</var><span className="sub">min</span> , &nbsp; <var>P</var><span className="sub">max</span> )
      </div>

      <div className="eq-box">
        <span className="eq-label">(Eq. 9)</span>
        <var>K</var><span className="sub">avail</span> = clamp( <var>α</var><span className="sub">K</span> · <var>pH</var> + <var>β</var><span className="sub">K</span> · <var>M</var> + <var>γ</var><span className="sub">K</span> , &nbsp; <var>K</var><span className="sub">min</span> , &nbsp; <var>K</var><span className="sub">max</span> )
      </div>

      <div className="where-block">
        <div>Where:</div>
        <div>• <var>α</var>, <var>β</var>, <var>γ</var> = Regression coefficients (crop-specific)</div>
        <div>• <var>pH</var> = Soil pH reading, <var>M</var> = Soil moisture (%)</div>
        <div>• clamp(<var>x</var>, <var>a</var>, <var>b</var>) = max(<var>a</var>, min(<var>b</var>, <var>x</var>)) — bounds the output to valid nutrient ranges</div>
      </div>

      {/* 3.2.6 Yield Prediction */}
      <h3>3.2.6 Yield Prediction — Multi-Factor Product Model</h3>

      <div className="eq-box">
        <span className="eq-label">(Eq. 10)</span>
        <var>Y</var><span className="sub">%</span> = 
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
          <span style={{ borderBottom: '1.5px solid #333', padding: '0 8px 2px' }}><var>H</var></span>
          <span style={{ padding: '2px 8px 0' }}>100</span>
        </span>
        &nbsp;×&nbsp;
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
          <span style={{ borderBottom: '1.5px solid #333', padding: '0 8px 2px' }}><var>P</var></span>
          <span style={{ padding: '2px 8px 0' }}>100</span>
        </span>
        &nbsp;× 100
      </div>

      <div className="where-block">
        <div>Where:</div>
        <div>• <var>Y</var><span className="sub">%</span> = Predicted yield as percentage of maximum potential</div>
        <div>• <var>H</var> = Plant Health Index (from Eq. 1)</div>
        <div>• <var>P</var> = Overall growth progress percentage = (<var>W</var><span className="sub">current</span> / <var>W</var><span className="sub">total</span>) × 100</div>
      </div>

      <p><strong>Constraint:</strong> Yield estimation is only computed when the crop has reached at least the flowering stage (stage index ≥ 2). Before flowering, the function returns "Too early to estimate."</p>

      <p><strong>Implementation:</strong> <span className="code-ref">getYieldEstimate()</span> in <span className="code-ref">src/data/cropData.ts</span>, lines 382–407.</p>

      {/* 3.2.7 Growth Height */}
      <h3>3.2.7 Plant Height — Linear Interpolation Model</h3>

      <div className="eq-box">
        <span className="eq-label">(Eq. 11)</span>
        <var>h</var>(<var>w</var>) = <var>h</var><span className="sub">min</span> + (<var>h</var><span className="sub">max</span> − <var>h</var><span className="sub">min</span>) × 
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
          <span style={{ borderBottom: '1.5px solid #333', padding: '0 8px 2px' }}><var>w</var> − <var>w</var><span className="sub">start</span></span>
          <span style={{ padding: '2px 8px 0' }}><var>w</var><span className="sub">end</span> − <var>w</var><span className="sub">start</span></span>
        </span>
      </div>

      <div className="where-block">
        <div>Where:</div>
        <div>• <var>h</var>(<var>w</var>) = Estimated plant height at week <var>w</var></div>
        <div>• <var>h</var><span className="sub">min</span>, <var>h</var><span className="sub">max</span> = Stage-specific height bounds (cm)</div>
        <div>• <var>w</var><span className="sub">start</span>, <var>w</var><span className="sub">end</span> = Start and end week of the current growth stage</div>
      </div>

      <p><strong>Implementation:</strong> <span className="code-ref">getExpectedHeight()</span> in <span className="code-ref">src/data/cropData.ts</span>, lines 366–380.</p>

      {/* 3.2.8 3D Parametric */}
      <h3>3.2.8 3D Growth Visualization — Parametric Rendering</h3>
      <p>
        The virtual field uses <strong>Three.js</strong> with parametric geometry scaling. Plant models are 
        rendered with dynamically computed scale factors:
      </p>

      <div className="eq-box">
        <span className="eq-label">(Eq. 12)</span>
        <var>G</var><span className="sub">scale</span> = <var>f</var>(<var>H</var>, <var>L</var>, <var>W</var>, <var>P</var>)
        &nbsp;&nbsp;=&nbsp;&nbsp;
        <var>P</var><span className="sub">progress</span> × (1 + 0.2 · <var>L</var> − 0.3 · <var>W</var>) × 
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
          <span style={{ borderBottom: '1.5px solid #333', padding: '0 8px 2px' }}><var>H</var></span>
          <span style={{ padding: '2px 8px 0' }}>100</span>
        </span>
      </div>

      <div className="where-block">
        <div>Where:</div>
        <div>• <var>G</var><span className="sub">scale</span> = Final geometry scale factor for 3D rendering</div>
        <div>• <var>H</var> = Plant Health Index, <var>L</var> = Light intensity factor (0–1)</div>
        <div>• <var>W</var> = Wilt factor (derived from low moisture), <var>P</var><span className="sub">progress</span> = Growth progress (0–1)</div>
      </div>

      <p>
        <strong>Fruit color</strong> is dynamically mapped from the ripeness stage color palette using 
        <span className="code-ref">getRipenessColor()</span>, transitioning through crop-specific color stages 
        (e.g., green → breaker → red for tomato).
      </p>

      <p><strong>Implementation:</strong> <span className="code-ref">VirtualField3D.tsx</span>, Three.js mesh generation and scaling logic.</p>

      {/* Footer */}
      <div style={{ borderTop: '2px solid #333', marginTop: '3rem', paddingTop: '1rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
        <p>— End of Section 3: Methodology —</p>
        <p style={{ marginTop: '8px' }}>Use Ctrl+P / Cmd+P to print this page or save as PDF</p>
      </div>
    </div>
  );
};

export default ResearchPaper;
