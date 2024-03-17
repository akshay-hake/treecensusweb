import { getDetails } from "use-places-autocomplete";

const commutesPerYear = 260 * 2;
const litresPerKM = 10 / 100;
const gasLitreCost = 1.5;
const litreCostKM = litresPerKM * gasLitreCost;
const secondsPerDay = 60 * 60 * 24;


export default function Distance({ leg, detail }) {
  if (!leg.distance || !leg.duration) return null;

  const days = Math.floor(
    (commutesPerYear * leg.duration.value) / secondsPerDay
  );
  const cost = Math.floor(
    (leg.distance.value / 1000) * litreCostKM * commutesPerYear
  );

  return (
    <div>
      <p>
        This tree is <span className="highlight">{leg.distance.text}</span> away
        from your office. That would take{" "}
        <span className="highlight">{leg.duration.text}</span> each direction.
      </p>

      <div>
        <table>
          <tr>
            <td>Serial no.</td>
            <td>{detail.sno}</td>
          </tr>
          <tr>
            <td>Tree Name : </td>
            <td>{detail.tname}</td>
          </tr>
          <tr>
            <td>Height : </td>
            <td>{detail.height}</td>
          </tr>
          <tr>
            <td>Age : </td>
            <td>{detail.age}</td>
          </tr>
        </table>
      </div>
    </div>
  );
}
