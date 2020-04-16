<script>
import { Line } from "vue-chartjs";
import gql from "graphql-tag";

export default {
  extends: Line,
  data() {
    return {
      gradient: null,
      gradient2: null
    };
  },
  props: {
    eloMap: {
      type: Object,
      required: true
    },
    compareTo: {
      type: Object,
      required: false
    }
  },
  mounted() {
    this.gradient = this.$refs.canvas;

    let datasets = [
      {
        label: "Elo",
        borderColor: "#141414",
        pointBackgroundColor: "#141414 ",
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 4,
        pointBorderColor: "#141414",
        backgroundColor: "transparent",
        data: Object.values(this.eloMap).map(t => t.elo)
      }
    ];
    if (this.compareTo.name)
      datasets = datasets.concat([
        {
          label: `${this.compareTo.name} Elo`,
          borderColor: "#1976d2",
          pointBackgroundColor: "#1976d2 ",
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 4,
          pointBorderColor: "#1976d2",
          backgroundColor: "transparent",
          data: Object.values(JSON.parse(this.compareTo.elo_map)).map(
            t => t.elo
          )
        }
      ]);

    this.renderChart(
      {
        labels: Object.keys(this.eloMap),
        datasets: datasets
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false }
      }
    );
  }
};
</script>
