import {
  generate100YearTimeline,
  calculateInitialAttributes,
  resolveTurnDecision,
  getTaiwanEraContext,
  LifeOption,
  calculateBaziSynastry,
} from '@celestial/astro-core';

/**
 * [P2-PROD-04] 平行時空 What-If 分岔對比推演：依據真實大運節點比較兩種抉擇路徑的十年運勢曲線
 */
export function runWhatIfBranchComparisonService(params: {
  birthDate: string;
  gender: '男' | '女';
  branchAge: number;
  pathALabel: string;
  pathBLabel: string;
}) {
  const birth = new Date(params.birthDate);
  const { baziChart, nodes } = generate100YearTimeline(birth, params.gender);
  const baseAttr = calculateInitialAttributes(baziChart);
  const startAge = Math.max(18, Math.min(70, Number(params.branchAge) || 28));
  const endAge = Math.min(95, startAge + 10);

  const simulatePath = (isAggressive: boolean) => {
    let curr = { ...baseAttr };
    const curve: Array<{ age: number; solarYear: number; career: number; wealth: number; health: number; wisdom: number }> = [];
    for (let a = startAge; a <= endAge; a++) {
      const node = nodes[a];
      if (!node) break;
      const opt: LifeOption = isAggressive
        ? { id: 'whatif_a', text: params.pathALabel, attitude: 'AGGRESSIVE', potentialImpact: { career: 6, wealth: 5, health: -2 }, riskLevel: 'HIGH' }
        : { id: 'whatif_b', text: params.pathBLabel, attitude: 'CONSERVATIVE', potentialImpact: { career: 2, wealth: 3, health: 3, wisdom: 3 }, riskLevel: 'LOW' };
      const res = resolveTurnDecision(curr, a, node.fortuneLevel, opt, undefined, node.solarYear);
      curr = res.newAttributes;
      curve.push({ age: a, solarYear: node.solarYear, career: curr.career, wealth: curr.wealth, health: curr.health, wisdom: curr.wisdom });
    }
    return { finalAttributes: curr, curve };
  };

  const pathA = simulatePath(true);
  const pathB = simulatePath(false);
  const attrA = pathA.finalAttributes;
  const attrB = pathB.finalAttributes;

  return {
    branchAge: startAge,
    dayMaster: baziChart.dayMaster.stem,
    pathA: { label: params.pathALabel, ...pathA },
    pathB: { label: params.pathBLabel, ...pathB },
    verdict:
      attrA.wealth + attrA.career > attrB.wealth + attrB.career
        ? `【${params.pathALabel}】十年累積財官動能高出 ${(attrA.wealth + attrA.career) - (attrB.wealth + attrB.career)} 點，但需留意健康消耗；【${params.pathBLabel}】則在身心與智慧積累更為穩健。`
        : `【${params.pathBLabel}】在未來十年展現更佳的綜合抗風險與穩健成長曲線。`,
  };
}

/**
 * [P2-PROD-04] 雙人合盤十年人生模擬
 */
export function runCoupleSimulationService(params: {
  person1: { name: string; gender: '男' | '女'; birthDate: string };
  person2: { name: string; gender: '男' | '女'; birthDate: string };
}) {
  const synastry = calculateBaziSynastry(
    { ...params.person1, birthDate: new Date(params.person1.birthDate), role: '甲方' },
    { ...params.person2, birthDate: new Date(params.person2.birthDate), role: '乙方' }
  );
  const { nodes } = generate100YearTimeline(new Date(params.person1.birthDate), params.person1.gender);
  const milestones = [24, 28, 32, 36, 42, 50].map((age) => {
    const node = nodes[age] || nodes[25];
    return {
      age,
      solarYear: node.solarYear,
      ganzhi: node.ganzhi,
      era: node.taiwanEraContext || getTaiwanEraContext(node.solarYear),
      jointTheme: node.fortuneLevel === '大吉' || node.fortuneLevel === '小吉'
        ? `雙人共創期：適合共同置產、事業合夥或家庭擴張（通關五行：${synastry.bridgingElement?.element || '水'}）`
        : `磨合守成期：宜借重${synastry.bridgingElement?.element || '水'}元素溝通協調，避開財務衝動`,
    };
  });

  return {
    synastryScore: synastry.score,
    level: synastry.level,
    bridgingElement: synastry.bridgingElement,
    milestones,
  };
}
